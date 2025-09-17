"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, Baby, Heart, Star, MessageCircle, Copy, QrCode, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function PagamentoPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [pixCode, setPixCode] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [qrCodeExpired, setQrCodeExpired] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [qrCodeGeneratedAt, setQrCodeGeneratedAt] = useState<Date | null>(null)

  const numerosParam = searchParams.get("numeros")
  const totalParam = searchParams.get("total")

  const selectedNumbers = numerosParam ? numerosParam.split(",").map(Number) : []
  const total = totalParam ? Number.parseFloat(totalParam) : 0

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (qrCodeGeneratedAt && !qrCodeExpired) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = now.getTime() - qrCodeGeneratedAt.getTime()
        const oneHour = 60 * 60 * 1000 // 1 hora em millisegundos
        const remaining = oneHour - elapsed

        if (remaining <= 0) {
          setQrCodeExpired(true)
          setTimeRemaining(0)
          setShowPayment(false)
          toast({
            title: "QR Code expirado",
            description: "O tempo limite de 1 hora foi atingido. Gere um novo QR Code.",
            variant: "destructive",
          })
        } else {
          setTimeRemaining(remaining)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [qrCodeGeneratedAt, qrCodeExpired, toast])

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const generatePixCode = (value: number, customerName: string) => {
    const pixKey = "brennolisboa8812@gmail.com" // Chave PIX real fornecida pelo usuário
    const merchantName = "RIFA DA MALU"
    const merchantCity = "SAO PAULO"
    const txId = Date.now().toString().slice(-10) // ID único da transação

    const merchantAccountInfo = `0014br.gov.bcb.pix01${pixKey.length.toString().padStart(2, "0")}${pixKey}`

    // Construindo payload EMV
    let payload = ""
    payload += "000201" // Payload Format Indicator
    payload += "010212" // Point of Initiation Method (12 = QR Code estático reutilizável)
    payload += `26${merchantAccountInfo.length.toString().padStart(2, "0")}${merchantAccountInfo}` // Merchant Account Information
    payload += "52040000" // Merchant Category Code
    payload += "5303986" // Transaction Currency (986 = BRL)
    payload += `54${value.toFixed(2).length.toString().padStart(2, "0")}${value.toFixed(2)}` // Transaction Amount
    payload += "5802BR" // Country Code
    payload += `59${merchantName.length.toString().padStart(2, "0")}${merchantName}` // Merchant Name
    payload += `60${merchantCity.length.toString().padStart(2, "0")}${merchantCity}` // Merchant City

    // Additional Data Field Template (tag 62)
    const additionalData = `05${txId.length.toString().padStart(2, "0")}${txId}`
    payload += `62${additionalData.length.toString().padStart(2, "0")}${additionalData}`

    payload += "6304" // CRC16 placeholder

    // Calcular CRC16
    const crc16 = calculateCRC16(payload)
    return payload + crc16
  }

  const calculateCRC16 = (payload: string) => {
    const polynomial = 0x1021
    let crc = 0xffff

    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ polynomial
        } else {
          crc <<= 1
        }
        crc &= 0xffff
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, "0")
  }

  const gerarPagamentoPix = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha seu nome e telefone.",
        variant: "destructive",
      })
      return
    }

    const pixCodeGenerated = generatePixCode(total, customerName)
    setPixCode(pixCodeGenerated)

    // Gerar QR Code usando API externa
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCodeGenerated)}&format=png&margin=10`
    setQrCodeUrl(qrUrl)
    setShowPayment(true)
    setQrCodeGeneratedAt(new Date())
    setQrCodeExpired(false)
    setTimeRemaining(60 * 60 * 1000) // 1 hora

    toast({
      title: "PIX gerado com sucesso!",
      description: "Escaneie o QR Code ou copie o código PIX. Válido por 1 hora.",
    })
  }

  const gerarNovoQrCode = () => {
    gerarPagamentoPix()
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    toast({
      title: "Código PIX copiado!",
      description: "Cole no seu app bancário para pagar.",
    })
  }

  const confirmarPagamento = () => {
    // Salvar dados no localStorage
    const purchaseData = {
      customerName,
      customerPhone,
      selectedNumbers,
      total,
      timestamp: new Date().toISOString(),
      status: "pending",
    }

    const existingData = JSON.parse(
      localStorage.getItem("rifaData") || '{"purchases": [], "pendingNumbers": [], "soldNumbers": []}',
    )
    existingData.purchases.push(purchaseData)
    existingData.pendingNumbers.push(...selectedNumbers)
    localStorage.setItem("rifaData", JSON.stringify(existingData))

    const whatsappNumber = "5575999859131"
    const message = `Olá! Acabei de fazer meu pedido na Rifa do Chá de Fralda da Malu 💕👶

📝 *Dados do pedido:*
• Nome: ${customerName}
• Telefone: ${customerPhone}
• Números: ${selectedNumbers.map((n) => n.toString().padStart(3, "0")).join(", ")}
• Total: R$ ${total.toFixed(2)}

💳 Já realizei o pagamento via PIX e gostaria de enviar o comprovante!

Obrigado(a)! 🎉`

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, "_blank")

    // Ainda mostrar a tela de confirmação
    setPaymentConfirmed(true)
  }

  useEffect(() => {
    const success = searchParams.get("success")
    const failure = searchParams.get("failure")
    const pending = searchParams.get("pending")

    if (success === "true") {
      setPaymentConfirmed(true)
    } else if (failure === "true") {
      toast({
        title: "Pagamento não aprovado",
        description: "Tente novamente ou escolha outra forma de pagamento.",
        variant: "destructive",
      })
    } else if (pending === "true") {
      toast({
        title: "Pagamento pendente",
        description: "Seu pagamento está sendo processado.",
      })
    }
  }, [searchParams, toast])

  if (selectedNumbers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="p-6 text-center">
            <Baby className="h-16 w-16 text-pink-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-pink-800 mb-4">Nenhum número selecionado 💕</h2>
            <p className="text-pink-600 mb-4">Você precisa selecionar pelo menos um número para continuar. 👶</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Rifa
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100">
        <header className="bg-white shadow-sm border-b border-pink-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-100 to-rose-200 p-2 rounded-full">
                <Baby className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  💕 Chá de Fralda da Malu 👶
                </h1>
                <p className="text-pink-600 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Pagamento
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto bg-white border-pink-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-pink-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-pink-800 mb-4">Pedido Confirmado! 🎉</h2>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg mb-6 border border-pink-200">
                <p className="text-pink-700 mb-4 text-lg font-medium">
                  Muito obrigada por participar da rifa do chá de fralda da Malu! 💕
                </p>
                <p className="text-pink-600 mb-4">
                  Sua participação é muito especial para nós e ajudará a tornar este momento ainda mais especial. 👶✨
                </p>
                <p className="text-pink-600 mb-4">
                  Obrigado, {customerName}! Seus números foram reservados e aguardam a confirmação do pagamento.
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-lg mb-6 border border-pink-200">
                <h3 className="font-semibold text-pink-800 mb-2 flex items-center justify-center gap-1">
                  <Star className="h-4 w-4" />
                  Resumo do Pedido: 👶
                </h3>
                <div className="flex flex-wrap gap-1 justify-center mb-2">
                  {selectedNumbers.map((number) => (
                    <Badge key={number} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                      {number.toString().padStart(3, "0")}
                    </Badge>
                  ))}
                </div>
                <p className="text-pink-700 font-medium">Total: R$ {total.toFixed(2)} 💰</p>
              </div>

              <p className="text-sm text-pink-600 mb-6 flex items-center justify-center gap-1">
                <Baby className="h-4 w-4" />
                Entraremos em contato pelo telefone {customerPhone} assim que o pagamento for confirmado. 📞
              </p>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg mb-6 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center justify-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Dúvidas? Entre em contato! 💬
                </h4>
                <p className="text-green-700 text-sm mb-3">
                  Se tiver alguma dúvida sobre a rifa ou o pagamento, entre no nosso grupo do WhatsApp:
                </p>
                <a
                  href="https://chat.whatsapp.com/KEtZjwkOsvi1MixDwH8iGu?mode=ems_copy_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Entrar no Grupo WhatsApp
                  </Button>
                </a>
              </div>

              <Link href="/">
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Rifa
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100">
      <header className="bg-white shadow-sm border-b border-pink-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-100 to-rose-200 p-2 rounded-full">
                <Baby className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  💕 Chá de Fralda da Malu 👶
                </h1>
                <p className="text-pink-600 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Pagamento
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Pedido */}
          <Card className="bg-white border-pink-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-pink-800 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Resumo do Pedido 💕
              </CardTitle>
              <CardDescription>Confirme os números selecionados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-pink-800 mb-2 flex items-center gap-1">
                  <Baby className="h-4 w-4" />
                  Números selecionados: 👶
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedNumbers.map((number) => (
                    <Badge key={number} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                      {number.toString().padStart(3, "0")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-pink-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Quantidade:</span>
                  <span>{selectedNumbers.length} números</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor unitário:</span>
                  <span>R$ 5,00</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-pink-800 mt-2">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="border-t border-pink-200 pt-4 space-y-4">
                <h4 className="font-medium text-pink-800 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Seus dados: 💕
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="border-pink-200 focus:border-pink-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone/WhatsApp</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="border-pink-200 focus:border-pink-400"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagamento PIX */}
          <Card className="bg-white border-pink-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-pink-800 flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Pagamento PIX 💳
              </CardTitle>
              <CardDescription>Pague instantaneamente via PIX</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showPayment || qrCodeExpired ? (
                <>
                  {qrCodeExpired && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200 text-center">
                      <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <h4 className="font-medium text-red-800 mb-2">⏰ Tempo Esgotado!</h4>
                      <p className="text-red-700 text-sm mb-3">
                        O QR Code expirou após 1 hora. Clique no botão abaixo para gerar um novo.
                      </p>
                      <Button
                        onClick={gerarNovoQrCode}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        disabled={!customerName.trim() || !customerPhone.trim()}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Gerar Novo QR Code
                      </Button>
                    </div>
                  )}

                  {!qrCodeExpired && (
                    <>
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-200">
                        <h4 className="font-medium text-pink-800 mb-2 flex items-center justify-center gap-1">
                          <Baby className="h-4 w-4" />
                          Como funciona: 👶
                        </h4>
                        <ol className="text-sm text-pink-700 space-y-1">
                          <li>1. 📝 Preencha seus dados ao lado</li>
                          <li>2. 💳 Clique em "Gerar PIX"</li>
                          <li>3. 📱 Escaneie o QR Code ou copie o código</li>
                          <li>4. ✅ Pague no seu app bancário</li>
                          <li>5. 🎉 Confirme o pagamento aqui</li>
                        </ol>
                      </div>

                      <Button
                        onClick={gerarPagamentoPix}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg"
                        disabled={!customerName.trim() || !customerPhone.trim()}
                      >
                        <QrCode className="h-4 w-4 mr-2" />💕 Gerar PIX - R$ {total.toFixed(2)}
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800 font-medium">Tempo restante:</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-800">⏰ {formatTimeRemaining(timeRemaining)}</div>
                    <p className="text-blue-600 text-xs mt-1">QR Code válido por 1 hora</p>
                  </div>

                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-pink-200 inline-block">
                      <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                    </div>
                    <p className="text-sm text-pink-600 mt-2">📱 Escaneie com seu app bancário</p>
                  </div>

                  {/* Código PIX */}
                  <div className="space-y-2">
                    <Label>Ou copie o código PIX:</Label>
                    <div className="flex gap-2">
                      <Input value={pixCode} readOnly className="font-mono text-xs border-pink-200" />
                      <Button
                        onClick={copyPixCode}
                        variant="outline"
                        className="border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 text-center">
                    <p className="text-green-800 font-bold text-xl">💰 R$ {total.toFixed(2)}</p>
                    <p className="text-green-600 text-sm">Valor será debitado automaticamente</p>
                  </div>

                  {/* Botão de confirmação */}
                  <Button
                    onClick={confirmarPagamento}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />✅ Já paguei - Confirmar Pedido
                  </Button>

                  <div className="text-center text-xs text-pink-600">
                    <p>🔒 PIX instantâneo e seguro</p>
                    <p>💳 Funciona 24h por dia, 7 dias por semana</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
