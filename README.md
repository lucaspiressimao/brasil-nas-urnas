# Brasil nas urnas

Mapa único da votação para presidente nas eleições de 4 de outubro de 2026 (1º turno, eleição TSE 6257).

- Vermelho: Lula à frente de Flávio Bolsonaro; azul: Flávio à frente de Lula.
- Quatro mais votados no Brasil e ranking independente por estado, ordenados por votos.
- Percentuais oficiais sobre todos os votos válidos.
- Apuração nacional e por estado, com horário do TSE.
- Consulta direta pelo navegador na abertura e a cada cinco minutos enquanto a página está visível.
- Nenhum servidor de aplicação, credencial ou GitHub Actions necessário.

Abra `index.html` ou acesse o GitHub Pages do projeto.

Fonte: [Resultados TSE](https://resultados.tse.jus.br/oficial/app/index.html#/eleicao/6257/uf/br/cargo/1/vis/nominal/resultados).
Mapa: [malhas IBGE](https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=UF).

Painel independente, sem vínculo com a Justiça Eleitoral. Resultados parciais não representam definição de vitória.

## Projeção final

Cada região (27 UFs e exterior) é extrapolada pela fração exata de seções totalizadas: votos projetados = votos atuais × seções totais ÷ seções totalizadas. Os votos de cada candidato são somados entre as regiões e divididos pela soma dos votos válidos projetados de todos os candidatos. Não se usa uma média simples dos percentuais estaduais ou apenas os quatro candidatos no denominador.

O cálculo assume a mesma distribuição dos votos e a mesma média de votos válidos por seção nas urnas restantes de cada região. Não é resultado oficial, pesquisa ou previsão estatística. Fica indisponível quando uma região está sem dados ou sem seções totalizadas.
