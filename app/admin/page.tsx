"use client"

import type React from "react"
import { useCallback, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wifi } from "lucide-react"
import {
  Baby,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  Trash2,
  Lock,
  LogOut,
  Heart,
  Star,
  Save,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Purchase {
  id: string
  customerName: string
  customerPhone: string
  numbers: number[]
  total: number
  status: "pending" | "confirmed" | "cancelled"
  createdAt: string
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    console.log("[v0] Tentativa de login - Usuário:", trimmedUsername)
    console.log("[v0] Tentativa de login - Senha:", trimmedPassword)
    console.log("[v0] Verificação - Usuário correto:", trimmedUsername === "Malu")
    console.log("[v0] Verificação - Senha correta:", trimmedPassword === "Mj1805")

    if (trimmedUsername === "Malu" && trimmedPassword === "Mj1805") {
      console.log("[v0] Login bem-sucedido, salvando no localStorage")
      localStorage.setItem("adminAuth", "true")
      console.log("[v0] AdminAuth salvo:", localStorage.getItem("adminAuth"))
      onLogin()
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vinda à área administrativa.",
      })
    } else {
      console.log("[v0] Login falhou - credenciais incorretas")
      setError("Usuário ou senha incorretos")
      setPassword("") // Limpar senha em caso de erro
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white border-pink-200 shadow-xl">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-pink-100 to-rose-200 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-8 w-8 text-pink-600" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            💕 Área Administrativa 👶
          </CardTitle>
          <CardDescription>Chá de Fralda da Malu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-pink-200 focus:border-pink-400"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-pink-200 focus:border-pink-400"
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              Entrar
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/">
              <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Rifa
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [lastSyncTime, setLastSyncTime] = useState<string>("")
  const [drawnNumber, setDrawnNumber] = useState<number | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawHistory, setDrawHistory] = useState<Array<{ number: number; date: string }>>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])

  const loadSavedData = useCallback(() => {
    try {
      const savedData = localStorage.getItem("rifaData")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        console.log("[v0] Dados carregados:", parsedData.purchases?.length || 0, "compras")

        if (parsedData.purchases && Array.isArray(parsedData.purchases)) {
          const convertedPurchases = parsedData.purchases.map((purchase: any, index: number) => ({
            id: purchase.id || (index + 1).toString(),
            customerName: purchase.customerName,
            customerPhone: purchase.customerPhone,
            numbers: purchase.selectedNumbers || purchase.numbers || [],
            total: purchase.total,
            status: purchase.status,
            createdAt: purchase.timestamp || purchase.createdAt || new Date().toISOString(),
          }))
          setPurchases(convertedPurchases)
        }
      }

      const savedDrawnNumber = localStorage.getItem("rifaDrawnNumber")
      if (savedDrawnNumber) {
        setDrawnNumber(Number.parseInt(savedDrawnNumber))
      }

      const savedDrawHistory = localStorage.getItem("rifaDrawHistory")
      if (savedDrawHistory) {
        setDrawHistory(JSON.parse(savedDrawHistory))
      }

      const lastSaved = localStorage.getItem("rifaLastSaved")
      if (lastSaved) {
        setLastSyncTime(new Date(lastSaved).toLocaleString())
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar dados:", error)
    }
  }, [])

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("adminAuth")
      console.log("[v0] Verificando autenticação - Status no localStorage:", authStatus)
      console.log("[v0] Verificando autenticação - Resultado:", authStatus === "true")
      setIsAuthenticated(authStatus === "true")
    }

    checkAuth()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "adminAuth") {
        console.log("[v0] Storage change detectado para adminAuth:", e.newValue)
        checkAuth()
      } else if (e.key === "rifaData") {
        loadSavedData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    loadSavedData()
    setIsLoading(false)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [loadSavedData])

  useEffect(() => {
    const interval = setInterval(() => {
      loadSavedData()
    }, 5000)

    return () => clearInterval(interval)
  }, [loadSavedData])

  const totalNumbers = 200
  const pricePerNumber = 1.0
  const prize = 400

  const soldNumbers = purchases.filter((p) => p.status === "confirmed").flatMap((p) => p.numbers)

  const pendingNumbers = purchases.filter((p) => p.status === "pending").flatMap((p) => p.numbers)

  const totalSold = soldNumbers.length
  const totalPending = pendingNumbers.length
  const totalRevenue = purchases.filter((p) => p.status === "confirmed").reduce((sum, p) => sum + p.total, 0)

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.customerPhone.includes(searchTerm) ||
      purchase.numbers.some((num) => num.toString().includes(searchTerm)),
  )

  const updatePurchaseStatus = (purchaseId: string, newStatus: "confirmed" | "cancelled") => {
    setPurchases((prev) => prev.map((p) => (p.id === purchaseId ? { ...p, status: newStatus } : p)))

    toast({
      title: newStatus === "confirmed" ? "Pagamento confirmado!" : "Compra cancelada",
      description: `O status da compra foi atualizado para ${newStatus === "confirmed" ? "confirmado" : "cancelado"}.`,
    })
  }

  const deletePurchase = (purchaseId: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== purchaseId))
    toast({
      title: "Compra removida",
      description: "A compra foi removida do sistema.",
    })
  }

  const saveAllChanges = () => {
    try {
      const timestamp = new Date().toISOString()
      const dataToSave = {
        purchases: purchases.map((p) => ({
          customerName: p.customerName,
          customerPhone: p.customerPhone,
          selectedNumbers: p.numbers,
          total: p.total,
          timestamp: p.createdAt,
          status: p.status,
        })),
        lastSaved: timestamp,
        totalSold: totalSold,
        totalRevenue: totalRevenue,
        soldNumbers: soldNumbers,
        pendingNumbers: pendingNumbers,
        drawnNumber: drawnNumber,
        drawHistory: drawHistory,
        version: Date.now(),
      }

      const existingData = JSON.parse(localStorage.getItem("rifaData") || "{}")
      const mergedData = { ...existingData, ...dataToSave }

      localStorage.setItem("rifaData", JSON.stringify(mergedData))
      localStorage.setItem("rifaLastSaved", timestamp)
      if (drawnNumber !== null) {
        localStorage.setItem("rifaDrawnNumber", drawnNumber.toString())
      }
      localStorage.setItem("rifaDrawHistory", JSON.stringify(drawHistory))

      setLastSyncTime(new Date(timestamp).toLocaleString())

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "rifaData",
          newValue: JSON.stringify(mergedData),
          url: window.location.href,
        }),
      )

      console.log("[v0] Dados salvos com sucesso:", mergedData)

      toast({
        title: "✅ Alterações salvas automaticamente!",
        description: `${purchases.length} compras sincronizadas. ${new Date().toLocaleTimeString()}`,
      })
    } catch (error) {
      console.error("[v0] Erro ao salvar:", error)
      toast({
        title: "❌ Erro ao salvar",
        description: "Ocorreu um erro ao salvar as alterações. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const performDraw = () => {
    setIsDrawing(true)

    let counter = 0
    const drawInterval = setInterval(() => {
      const randomNum = Math.floor(Math.random() * 200) + 1
      setDrawnNumber(randomNum)
      counter++

      if (counter >= 20) {
        clearInterval(drawInterval)
        const finalNumber = Math.floor(Math.random() * 200) + 1
        setDrawnNumber(finalNumber)

        const newDraw = {
          number: finalNumber,
          date: new Date().toISOString(),
        }
        setDrawHistory((prev) => [newDraw, ...prev])

        setIsDrawing(false)

        const winner = purchases.find((p) => p.status === "confirmed" && p.numbers.includes(finalNumber))

        if (winner) {
          toast({
            title: "🎉 Temos um vencedor!",
            description: `Número ${finalNumber.toString().padStart(3, "0")} - ${winner.customerName}`,
          })
        } else {
          toast({
            title: "🎲 Número sorteado!",
            description: `Número ${finalNumber.toString().padStart(3, "0")} - Não vendido`,
          })
        }

        setTimeout(() => {
          saveAllChanges()
        }, 1000)
      }
    }, 100)
  }

  const clearDraw = () => {
    setDrawnNumber(null)
    localStorage.removeItem("rifaDrawnNumber")
    toast({
      title: "Sorteio limpo",
      description: "O número sorteado foi removido.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
      case "pending":
        return "bg-yellow-500 text-white"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendente"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    setIsAuthenticated(false)
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado da área administrativa.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100 flex items-center justify-center">
        <div className="text-pink-600 flex items-center gap-2">
          <Baby className="h-5 w-5 animate-bounce" />
          Carregando...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-rose-100">
      <header className="bg-white shadow-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-100 to-rose-200 p-2 rounded-full">
                <Baby className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  💕 Administração - Chá de Fralda da Malu 👶
                </h1>
                <p className="text-pink-600 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Painel de controle da rifa
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={saveAllChanges}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />💾 Salvar Alterações
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              <Link href="/">
                <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar à Rifa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {lastSyncTime && (
          <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
            <p className="text-sm text-pink-700 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              Sistema sincronizado em tempo real • Última atualização: {lastSyncTime}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-pink-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-800">{totalSold}</div>
              <div className="text-sm text-pink-600">✅ Números Vendidos</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-rose-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-rose-800">{totalPending}</div>
              <div className="text-sm text-rose-600">⏳ Pendentes</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-pink-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-800">{totalNumbers - totalSold - totalPending}</div>
              <div className="text-sm text-pink-600">✨ Disponíveis</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-rose-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-rose-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-rose-800">R$ {totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-rose-600">💰 Arrecadado</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList className="bg-white border border-pink-200">
            <TabsTrigger
              value="purchases"
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
            >
              💕 Compras
            </TabsTrigger>
            <TabsTrigger value="numbers" className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-800">
              🔢 Números
            </TabsTrigger>
            <TabsTrigger value="draw" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800">
              🎲 Sorteio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <Card className="bg-white border-pink-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-pink-800 flex items-center gap-2">
                      <Baby className="h-4 w-4" />
                      Gerenciar Compras 👶
                    </CardTitle>
                    <CardDescription>Visualize e gerencie todas as compras da rifa</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-600" />
                      <Input
                        placeholder="Buscar por nome, telefone ou número..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-pink-200 focus:border-pink-400"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPurchases.map((purchase) => (
                    <div key={purchase.id} className="border border-pink-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-pink-800 flex items-center gap-1">
                            <Baby className="h-4 w-4" />
                            {purchase.customerName}
                          </h3>
                          <p className="text-sm text-pink-600">{purchase.customerPhone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(purchase.status)}>{getStatusText(purchase.status)}</Badge>
                          <span className="text-sm font-medium text-pink-800">R$ {purchase.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-pink-700 mb-1 flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          Números selecionados:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {purchase.numbers.map((number) => (
                            <Badge key={number} variant="outline" className="border-pink-300 text-pink-700">
                              {number.toString().padStart(3, "0")}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-pink-600">{new Date(purchase.createdAt).toLocaleString("pt-BR")}</p>
                        <div className="flex gap-2">
                          {purchase.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updatePurchaseStatus(purchase.id, "confirmed")}
                                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePurchaseStatus(purchase.id, "cancelled")}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePurchase(purchase.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredPurchases.length === 0 && (
                    <div className="text-center py-8">
                      <Baby className="h-12 w-12 text-pink-400 mx-auto mb-2" />
                      <p className="text-pink-600">Nenhuma compra encontrada. 💕</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="numbers">
            <Card className="bg-white border-rose-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-rose-800 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Visualização dos Números 🔢
                </CardTitle>
                <CardDescription>Status de todos os números da rifa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded"></div>
                    <span>Vendido ✅</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Pendente ⏳</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100"></div>
                    <span>Disponível ✨</span>
                  </div>
                </div>

                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: totalNumbers }, (_, i) => i + 1).map((number) => {
                    const isSold = soldNumbers.includes(number)
                    const isPending = pendingNumbers.includes(number)

                    let className =
                      "aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-all "

                    if (isSold) {
                      className += "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md"
                    } else if (isPending) {
                      className += "bg-yellow-500 text-white shadow-md"
                    } else {
                      className += "bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100"
                    }

                    return (
                      <div key={number} className={className}>
                        {number.toString().padStart(3, "0")}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draw">
            <div className="space-y-6">
              <Card className="bg-white border-pink-200 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-pink-800 flex items-center justify-center gap-2 text-3xl">
                    🎲 Sorteio da Rifa 🎉
                  </CardTitle>
                  <CardDescription>Realize o sorteio do número vencedor</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl p-8 border-2 border-pink-200">
                    {drawnNumber !== null ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-pink-800">🏆 Número Sorteado:</h3>
                        <div
                          className={`text-8xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent ${isDrawing ? "animate-pulse" : ""}`}
                        >
                          {drawnNumber.toString().padStart(3, "0")}
                        </div>
                        {!isDrawing && (
                          <div className="mt-4">
                            {(() => {
                              const winner = purchases.find(
                                (p) => p.status === "confirmed" && p.numbers.includes(drawnNumber),
                              )
                              return winner ? (
                                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-lg">
                                  <p className="text-xl font-bold">🎉 VENCEDOR!</p>
                                  <p className="text-lg">{winner.customerName}</p>
                                  <p className="text-sm opacity-90">{winner.customerPhone}</p>
                                </div>
                              ) : (
                                <div className="bg-gray-100 text-gray-700 p-4 rounded-lg">
                                  <p className="text-lg">Número não vendido</p>
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Baby className="h-16 w-16 text-pink-400 mx-auto" />
                        <p className="text-xl text-pink-600">Pronto para o sorteio! 💕</p>
                        <p className="text-pink-500">Clique no botão abaixo para sortear o número vencedor</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={performDraw}
                      disabled={isDrawing}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 text-lg shadow-lg"
                    >
                      {isDrawing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sorteando...
                        </>
                      ) : (
                        <>🎲 Realizar Sorteio</>
                      )}
                    </Button>

                    {drawnNumber !== null && !isDrawing && (
                      <Button
                        onClick={clearDraw}
                        variant="outline"
                        className="border-pink-300 text-pink-700 hover:bg-pink-50 px-6 py-3 bg-transparent"
                      >
                        🗑️ Limpar Sorteio
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {drawHistory.length > 0 && (
                <Card className="bg-white border-rose-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-rose-800 flex items-center gap-2">📋 Histórico de Sorteios</CardTitle>
                    <CardDescription>Últimos sorteios realizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {drawHistory.slice(0, 10).map((draw, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                              {draw.number.toString().padStart(3, "0")}
                            </div>
                            <div>
                              <p className="font-semibold text-pink-800">Número {draw.number}</p>
                              <p className="text-sm text-pink-600">{new Date(draw.date).toLocaleString("pt-BR")}</p>
                            </div>
                          </div>
                          {(() => {
                            const winner = purchases.find(
                              (p) => p.status === "confirmed" && p.numbers.includes(draw.number),
                            )
                            return winner ? (
                              <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                                🏆 {winner.customerName}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-300 text-gray-600">
                                Não vendido
                              </Badge>
                            )
                          })()}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
