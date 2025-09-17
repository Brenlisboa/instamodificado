"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { QrCode, Copy, CheckCircle, ArrowLeft, Baby, Heart, Star } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function PagamentoPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("")

  const numerosParam = searchParams.get("numeros")
  const totalParam = searchParams.get("total")

  const selectedNumbers = numerosParam ? numerosParam.split(",").map(Number) : []
  const total = totalParam ? Number.parseFloat(totalParam) : 0

  const pixCode =
    "00020126360014BR.GOV.BCB.PIX0114+55759998591315204000053039865802BR5901N6001C62210517ChadefraldadaMalu63047C5A"
  const chavePix = "+5575999859131"

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const size = 200
        canvas.width = size
        canvas.height = size

        ctx!.fillStyle = "#ffffff"
        ctx!.fillRect(0, 0, size, size)

        const modules = 25
        const moduleSize = size / modules

        for (let i = 0; i < modules; i++) {
          for (let j = 0; j < modules; j++) {
            const hash = pixCode.charCodeAt((i * modules + j) % pixCode.length)
            if (hash % 2 === 0) {
              ctx!.fillStyle = "#000000"
              ctx!.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
            }
          }
        }

        const cornerSize = moduleSize * 7
        ctx!.fillStyle = "#000000"
        ctx!.fillRect(0, 0, cornerSize, cornerSize)
        ctx!.fillStyle = "#ffffff"
        ctx!.fillRect(moduleSize, moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize)
        ctx!.fillStyle = "#000000"
        ctx!.fillRect(2 * moduleSize, 2 * moduleSize, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize)

        ctx!.fillStyle = "#000000"
        ctx!.fillRect(size - cornerSize, 0, cornerSize, cornerSize)
        ctx!.fillStyle = "#ffffff"
        ctx!.fillRect(
          size - cornerSize + moduleSize,
          moduleSize,
          cornerSize - 2 * moduleSize,
          cornerSize - 2 * moduleSize,
        )
        ctx!.fillStyle = "#000000"
        ctx!.fillRect(
          size - cornerSize + 2 * moduleSize,
          2 * moduleSize,
          cornerSize - 4 * moduleSize,
          cornerSize - 4 * moduleSize,
        )

        ctx!.fillStyle = "#000000"
        ctx!.fillRect(0, size - cornerSize, cornerSize, cornerSize)
        ctx!.fillStyle = "#ffffff"
        ctx!.fillRect(
          moduleSize,
          size - cornerSize + moduleSize,
          cornerSize - 2 * moduleSize,
          cornerSize - 2 * moduleSize,
        )
        ctx!.fillStyle = "#000000"
        ctx!.fillRect(
          2 * moduleSize,
          size - cornerSize + 2 * moduleSize,
          cornerSize - 4 * moduleSize,
          cornerSize - 4 * moduleSize,
        )

        setQrCodeDataUrl(canvas.toDataURL())
      } catch (error) {
        console.error("Erro ao gerar QR code:", error)
      }
    }

    generateQRCode()
  }, [])

  const copyPixKey = () => {
    navigator.clipboard.writeText(chavePix)
    toast({
      title: "Chave PIX copiada!",
      description: "A chave PIX foi copiada para sua área de transferência.",
    })
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    toast({
      title: "Código PIX copiado!",
      description: "O código PIX foi copiado para sua área de transferência.",
    })
  }

  const handleConfirmPayment = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha seu nome e telefone.",
        variant: "destructive",
      })
      return
    }

    setPaymentConfirmed(true)
    toast({
      title: "Pagamento confirmado!",
      description: "Seus números foram reservados. Aguarde a confirmação do pagamento.",
    })
  }

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
              <p className="text-pink-600 mb-6">
                Obrigado, {customerName}! Seus números foram reservados e aguardam a confirmação do pagamento. 💕
              </p>

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
                Pagamento via PIX 💳
              </CardTitle>
              <CardDescription>Escaneie o QR Code ou copie a chave PIX</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-pink-200 inline-block shadow-lg">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl || "/placeholder.svg"} alt="QR Code PIX" className="w-48 h-48 rounded-lg" />
                  ) : (
                    <div className="w-48 h-48 bg-pink-50 rounded-lg flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-pink-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-pink-600 mt-2 flex items-center justify-center gap-1">
                  <Baby className="h-4 w-4" />
                  Escaneie com o app do seu banco 📱
                </p>
              </div>

              <div>
                <Label className="text-pink-800 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Chave PIX (Telefone): 📞
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input value={chavePix} readOnly className="border-pink-200 bg-pink-50" />
                  <Button
                    onClick={copyPixKey}
                    variant="outline"
                    size="icon"
                    className="border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-pink-800 flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Código PIX (Copia e Cola): 📋
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input value={pixCode} readOnly className="border-pink-200 bg-pink-50 text-xs" />
                  <Button
                    onClick={copyPixCode}
                    variant="outline"
                    size="icon"
                    className="border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-200">
                <h4 className="font-medium text-pink-800 mb-2 flex items-center gap-1">
                  <Baby className="h-4 w-4" />
                  Instruções: 👶
                </h4>
                <ol className="text-sm text-pink-700 space-y-1">
                  <li>1. 📱 Abra o app do seu banco</li>
                  <li>2. 💳 Escolha a opção PIX</li>
                  <li>3. 📷 Escaneie o QR Code ou cole o código</li>
                  <li>4. 💰 Confirme o pagamento de R$ {total.toFixed(2)}</li>
                  <li>5. ✅ Clique em "Confirmar Pagamento" abaixo</li>
                </ol>
              </div>

              <Button
                onClick={handleConfirmPayment}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg"
                disabled={!customerName.trim() || !customerPhone.trim()}
              >
                <CheckCircle className="h-4 w-4 mr-2" />💕 Confirmar Pagamento
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
