import CryptoJS from "crypto-js"

// Chave secreta para criptografia (em produção, deve vir de variável de ambiente)
const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_KEY || "rifa-malu-2024-secure-key-v1"

// Função para criptografar dados
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data)
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString()
    return encrypted
  } catch (error) {
    console.error("[v0] Erro ao criptografar dados:", error)
    throw new Error("Falha na criptografia dos dados")
  }
}

// Função para descriptografar dados
export function decryptData(encryptedData: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error("[v0] Erro ao descriptografar dados:", error)
    return null
  }
}

// Função para gerar hash seguro
export function generateSecureHash(data: string): string {
  return CryptoJS.SHA256(data + SECRET_KEY).toString()
}

// Função para validar integridade dos dados
export function validateDataIntegrity(data: any, hash: string): boolean {
  const dataString = JSON.stringify(data)
  const calculatedHash = generateSecureHash(dataString)
  return calculatedHash === hash
}

// Função para sanitizar entrada do usuário
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
}

// Função para gerar token único seguro
export function generateSecureToken(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2)
  return generateSecureHash(timestamp + random)
}

// Função para criptografar dados sensíveis do localStorage
export function setSecureLocalStorage(key: string, data: any): void {
  try {
    const encryptedData = encryptData(data)
    const hash = generateSecureHash(JSON.stringify(data))
    const securePackage = {
      data: encryptedData,
      hash: hash,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(securePackage))
  } catch (error) {
    console.error("[v0] Erro ao salvar dados seguros:", error)
  }
}

// Função para descriptografar dados do localStorage
export function getSecureLocalStorage(key: string): any {
  try {
    const storedData = localStorage.getItem(key)
    if (!storedData) return null

    const securePackage = JSON.parse(storedData)
    const decryptedData = decryptData(securePackage.data)

    if (!decryptedData) return null

    // Validar integridade dos dados
    if (!validateDataIntegrity(decryptedData, securePackage.hash)) {
      console.warn("[v0] Dados corrompidos detectados, removendo...")
      localStorage.removeItem(key)
      return null
    }

    return decryptedData
  } catch (error) {
    console.error("[v0] Erro ao recuperar dados seguros:", error)
    return null
  }
}

// Função para limpar dados sensíveis
export function clearSecureData(): void {
  try {
    // Lista de chaves sensíveis para limpar
    const sensitiveKeys = ["rifaData", "adminAuth", "userSession"]
    sensitiveKeys.forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error("[v0] Erro ao limpar dados seguros:", error)
  }
}
