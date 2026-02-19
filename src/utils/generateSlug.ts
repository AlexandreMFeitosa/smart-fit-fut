export function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD") // Decompõe caracteres acentuados (ex: á -> a + ´)
      .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
      .replace(/[^a-z0-9\s-]/g, "") // Remove tudo que não for letra, número ou espaço
      .trim()
      .replace(/\s+/g, "-"); // Substitui espaços por hífens
  }