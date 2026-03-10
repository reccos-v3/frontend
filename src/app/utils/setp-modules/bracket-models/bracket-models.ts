export const bracketModels = [
  {
    id: 'FIXED_BALANCED',
    name: 'Árvore Fixa',
    description:
      'O desenho da árvore é gerado por completo. Ideal para torneios tradicionais com chaveamento definido até a final.',
    icon: 'account_tree',
  },
  {
    id: 'SEQUENTIAL',
    name: 'Fase a Fase',
    description:
      'Os confrontos são gerados apenas para a fase atual. Permite maior flexibilidade de re-chaveamento entre as fases.',
    icon: 'layers',
  },
  {
    id: 'MANUAL',
    name: 'Quadro Manual',
    description:
      'Liberdade total. Você define manualmente quem enfrenta quem diretamente no quadro de jogos.',
    icon: 'draw',
  },
];
