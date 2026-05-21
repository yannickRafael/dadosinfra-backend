const fs = require('fs')
const path = require('path')

const provinces = ['Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambezia', 'Nampula', 'Cabo Delgado', 'Niassa']
const sectors = ['transport', 'water', 'energy', 'education', 'health']
const projectStatuses = ['identification', 'preparation', 'implementation', 'completion', 'maintenance', 'decommissioning', 'cancelled']
const tenderStatuses = ['planned', 'active', 'complete', 'cancelled']
const contractStatuses = ['pending', 'active', 'terminated', 'cancelled']
const procurementMethods = ['open', 'limited', 'selective', 'direct']
const documentTypes = ['feasibilityStudy', 'tenderNotice', 'contractSigned', 'completionCertificate', 'environmentalImpact', 'progressReport']
const currencies = ['USD', 'MZN']

const sectorTitles = {
  transport: ['Road Rehabilitation', 'Bridge Construction', 'Highway Upgrade', 'Rural Road Paving', 'Urban Road Expansion'],
  water:     ['Water Supply System', 'Sanitation Network', 'Borehole Drilling', 'Water Treatment Plant', 'Irrigation Canal'],
  energy:    ['Solar Grid Installation', 'Power Line Extension', 'Substation Upgrade', 'Rural Electrification', 'Hydropower Study'],
  education: ['Primary School Construction', 'Secondary School Rehabilitation', 'Technical College Expansion', 'Teacher Training Centre'],
  health:    ['Health Centre Construction', 'District Hospital Upgrade', 'Maternity Ward Rehabilitation', 'Medical Supply Depot']
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const amount = () => rand(500000, 500000000)
const isoDate = (year, month, day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
const pastDate = () => isoDate(rand(2018, 2023), rand(1, 12), rand(1, 28))
const futureDate = () => isoDate(rand(2024, 2028), rand(1, 12), rand(1, 28))

const organisations = [
  'Administração Nacional de Estradas',
  'Fundo de Estradas',
  'Ministério das Obras Públicas',
  'FIPAG',
  'EDM - Electricidade de Moçambique',
  'Ministério da Educação',
  'Ministério da Saúde',
  'DPOPH Nampula',
  'DPOPH Sofala',
  'Banco Mundial',
  'African Development Bank',
  'JICA Mozambique',
  'China Road and Bridge Corporation',
  'Mota-Engil Moçambique',
  'Conduril Engenharia',
  'STFA Group'
]

const data = []

for (let i = 1; i <= 50; i++) {
  const province = pick(provinces)
  const sector = pick(sectors)
  const status = pick(projectStatuses)
  const title = `${province} ${pick(sectorTitles[sector])}`
  const startDate = pastDate()
  const endDate = futureDate()
  const budgetAmount = amount()
  const currency = pick(currencies)

  const tenderCount = rand(1, 3)
  const tenders = []
  for (let t = 0; t < tenderCount; t++) {
    tenders.push({
      title: `${title} — Works Contract Lot ${t + 1}`,
      status: pick(tenderStatuses),
      procurementMethod: pick(procurementMethods),
      value: { amount: Math.floor(budgetAmount * rand(40, 60) / 100), currency },
      tenderPeriod: { startDate: pastDate(), endDate: pastDate() }
    })
  }

  const contractCount = rand(1, 2)
  const contracts = []
  for (let c = 0; c < contractCount; c++) {
    contracts.push({
      title: `${title} — Civil Works Lot ${c + 1}`,
      status: pick(contractStatuses),
      supplier: pick(organisations),
      value: { amount: Math.floor(budgetAmount * rand(35, 55) / 100), currency },
      dateSigned: pastDate(),
      period: { startDate: pastDate(), endDate: futureDate() }
    })
  }

  const documentCount = rand(2, 4)
  const documents = []
  const usedTypes = []
  for (let d = 0; d < documentCount; d++) {
    let docType = pick(documentTypes)
    while (usedTypes.includes(docType)) docType = pick(documentTypes)
    usedTypes.push(docType)
    documents.push({
      title: `${title} — ${docType}`,
      documentType: docType,
      format: 'application/pdf',
      datePublished: pastDate()
    })
  }

  data.push({
    ocid: `ocds-abc123-MZ-${String(i).padStart(4, '0')}`,
    title,
    description: `${status.charAt(0).toUpperCase() + status.slice(1)} phase of the ${title.toLowerCase()} project in ${province} province. Funded under the national infrastructure development programme.`,
    status,
    sector,
    province,
    budget: { amount: budgetAmount, currency },
    period: { startDate, endDate },
    parties: [
      { name: pick(organisations), role: 'buyer' },
      { name: pick(organisations), role: 'procuringEntity' },
      { name: pick(organisations), role: 'funder' }
    ],
    isPublic: Math.random() > 0.2,
    tenders,
    contracts,
    documents
  })
}

const outPath = path.join(__dirname, 'data.json')
fs.writeFileSync(outPath, JSON.stringify(data, null, 2))

const totalTenders = data.reduce((s, p) => s + p.tenders.length, 0)
const totalContracts = data.reduce((s, p) => s + p.contracts.length, 0)
const totalDocuments = data.reduce((s, p) => s + p.documents.length, 0)

console.log(`Generated ${data.length} projects`)
console.log(`  Tenders:   ${totalTenders}`)
console.log(`  Contracts: ${totalContracts}`)
console.log(`  Documents: ${totalDocuments}`)
console.log(`  Total:     ${data.length + totalTenders + totalContracts + totalDocuments} documents`)
console.log(`Written to ${outPath}`)
