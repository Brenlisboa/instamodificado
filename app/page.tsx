"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Baby, Gift, Users, Crown, Heart, Star, Wifi } from "lucide-react"
import Link from "next/link"

export default function RifaPage() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [soldNumbers, setSoldNumbers] = useState<number[]>([1, 5, 12, 23, 45, 67, 89, 100, 134, 156, 178, 199])
  const [pendingNumbers, setPendingNumbers] = useState<number[]>([])
  const [lastSync, setLastSync] = useState<string>("")
  const [isOnline, setIsOnline] = useState(true)

  const totalNumbers = 200
  const pricePerNumber = 1.0 // Alterando preço por número de 5.0 para 1.0
  const prize = 400
  const availableNumbers = totalNumbers - soldNumbers.length - pendingNumbers.length

  const loadRifaData = useCallback(() => {
    try {
      const savedData = localStorage.getItem("rifaData")
      if (savedData) {
        const data = JSON.parse(savedData)
        if (data.soldNumbers && Array.isArray(data.soldNumbers)) {
          setSoldNumbers(data.soldNumbers)
        }
        if (data.pendingNumbers && Array.isArray(data.pendingNumbers)) {
          setPendingNumbers(data.pendingNumbers)
        }
        if (data.lastSaved) {
          setLastSync(new Date(data.lastSaved).toLocaleTimeString())
        }
        console.log("[v0] Dados sincronizados:", data)
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar dados:", error)
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "rifaData" && e.newValue) {
        console.log("[v0] Detectada mudança no localStorage, sincronizando...")
        loadRifaData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [loadRifaData])

  useEffect(() => {
    loadRifaData() // Carregamento inicial

    const interval = setInterval(() => {
      loadRifaData()
    }, 5000) // Atualiza a cada 5 segundos

    return () => clearInterval(interval)
  }, [loadRifaData])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleNumberSelect = (number: number) => {
    if (soldNumbers.includes(number) || pendingNumbers.includes(number)) return

    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number))
    } else {
      setSelectedNumbers([...selectedNumbers, number])
    }
  }

  const totalPrice = selectedNumbers.length * pricePerNumber

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
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
                  Rifa Beneficente
                  <span className="ml-2 flex items-center gap-1 text-xs">
                    <Wifi className={`h-3 w-3 ${isOnline ? "text-green-500" : "text-red-500"}`} />
                    {lastSync && `Última sync: ${lastSync}`}
                  </span>
                </p>
              </div>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent">
                Área Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-pink-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <Gift className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-800">R$ {prize}</div>
              <div className="text-sm text-pink-600">🎁 Prêmio</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-rose-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-rose-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-rose-800">{availableNumbers}</div>
              <div className="text-sm text-rose-600">✨ Disponíveis</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-pink-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-800">R$ {pricePerNumber.toFixed(2)}</div>
              <div className="text-sm text-pink-600">💰 Por número</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-rose-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-rose-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-rose-800">{selectedNumbers.length}</div>
              <div className="text-sm text-rose-600">🌟 Selecionados</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seleção de Números */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-pink-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-pink-800 flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  Escolha seus números da sorte 🍀
                </CardTitle>
                <CardDescription>
                  Clique nos números para selecioná-los. Números em vermelho já foram vendidos, em amarelo estão
                  pendentes. 💕
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: totalNumbers }, (_, i) => i + 1).map((number) => {
                    const isSold = soldNumbers.includes(number)
                    const isPending = pendingNumbers.includes(number)
                    const isSelected = selectedNumbers.includes(number)

                    return (
                      <button
                        key={number}
                        onClick={() => handleNumberSelect(number)}
                        disabled={isSold || isPending}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all
                          ${
                            isSold
                              ? "bg-red-100 text-red-400 cursor-not-allowed"
                              : isPending
                                ? "bg-yellow-100 text-yellow-600 cursor-not-allowed"
                                : isSelected
                                  ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md scale-105"
                                  : "bg-gradient-to-br from-pink-50 to-rose-50 text-pink-700 hover:from-pink-100 hover:to-rose-100 hover:scale-105 border border-pink-200"
                          }
                        `}
                      >
                        {number.toString().padStart(3, "0")}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo e Pagamento */}
          <div>
            <Card className="bg-white border-pink-200 sticky top-4 shadow-lg">
              <CardHeader>
                <CardTitle className="text-pink-800 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Resumo do Pedido 💕
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedNumbers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-pink-800 mb-2 flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Números selecionados:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedNumbers.map((number) => (
                        <Badge key={number} variant="secondary" className="bg-pink-100 text-pink-800">
                          {number.toString().padStart(3, "0")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-pink-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Quantidade:</span>
                    <span>{selectedNumbers.length} números</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Valor unitário:</span>
                    <span>R$ {pricePerNumber.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-pink-800 mt-2">
                    <span>Total:</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {selectedNumbers.length > 0 && (
                  <Link href={`/pagamento?numeros=${selectedNumbers.join(",")}&total=${totalPrice.toFixed(2)}`}>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg">
                      💳 Finalizar Compra
                    </Button>
                  </Link>
                )}

                {selectedNumbers.length === 0 && (
                  <p className="text-center text-pink-600 text-sm flex items-center justify-center gap-1">
                    <Baby className="h-4 w-4" />
                    Selecione pelo menos um número para continuar 💕
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
