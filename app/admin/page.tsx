"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

    if (username === "Malu" && password === "Mj1805") {
      localStorage.setItem("adminAuth", "true")
      onLogin()
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vinda à área administrativa.",
      })
    } else {
      setError("Usuário ou senha incorretos")
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
  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: "1",
      customerName: "Maria Silva",
      customerPhone: "(11) 99999-1111",
      numbers: [1, 5, 12],
      total: 15.0,
      status: "confirmed",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      customerName: "João Santos",
      customerPhone: "(11) 99999-2222",
      numbers: [23, 45, 67, 89],
      total: 20.0,
      status: "pending",
      createdAt: "2024-01-15T14:20:00Z",
    },
    {
      id: "3",
      customerName: "Ana Costa",
      customerPhone: "(11) 99999-3333",
      numbers: [100, 134],
      total: 10.0,
      status: "confirmed",
      createdAt: "2024-01-15T16:45:00Z",
    },
    {
      id: "4",
      customerName: "Pedro Oliveira",
      customerPhone: "(11) 99999-4444",
      numbers: [156, 178, 199],
      total: 15.0,
      status: "pending",
      createdAt: "2024-01-15T18:10:00Z",
    },
  ])

  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuth")
    setIsAuthenticated(authStatus === "true")

    // Carregar dados salvos
    const savedPurchases = localStorage.getItem("rifaPurchases")
    if (savedPurchases) {
      try {
        setPurchases(JSON.parse(savedPurchases))
      } catch (error) {
        console.error("Erro ao carregar dados salvos:", error)
      }
    }

    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    setIsAuthenticated(false)
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado da área administrativa.",
    })
  }

  const totalNumbers = 200
  const pricePerNumber = 5.0
  const prize = 400

  // Calcular estatísticas
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
      const dataToSave = {
        purchases: purchases,
        lastSaved: new Date().toISOString(),
        totalSold: totalSold,
        totalRevenue: totalRevenue,
        soldNumbers: soldNumbers,
        pendingNumbers: pendingNumbers,
      }

      // Salvar dados no localStorage
      localStorage.setItem("rifaPurchases", JSON.stringify(purchases))
      localStorage.setItem("rifaData", JSON.stringify(dataToSave))
      localStorage.setItem("rifaLastSaved", new Date().toISOString())

      console.log("[v0] Dados salvos:", dataToSave)
      console.log("[v0] Total de compras salvas:", purchases.length)

      toast({
        title: "✅ Alterações salvas com sucesso!",
        description: `${purchases.length} compras salvas. Última atualização: ${new Date().toLocaleTimeString()}`,
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
      {/* Header */}
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
        {/* Cards de Estatísticas */}
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
          </TabsList>

          {/* Aba de Compras */}
          <TabsContent value="purchases">
            <Card className="bg-white border-pink-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-pink-800 flex items-center gap-2">
                      <Heart className="h-5 w-5" />
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

          {/* Aba de Números */}
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
                    <div className="w-4 h-4 bg-pink-50 border border-pink-200 rounded"></div>
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
        </Tabs>
      </main>
    </div>
  )
}
