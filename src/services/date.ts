// Função responsavél por mostrar a data atual no formato YYYY-MM-DD
export function getToday(): string {
    return new Date().toISOString().split('T')[0];
}
