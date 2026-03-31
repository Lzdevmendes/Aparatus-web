import { PrismaClient, SalonGender } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// Imagens por tipo
const IMG = {
  MASCULINE: [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
    "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800&q=80",
    "https://images.unsplash.com/photo-1512864084360-7c0d4d261cf5?w=800&q=80",
  ],
  FEMININE: [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80",
  ],
  UNISEX: [
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80",
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
    "https://images.unsplash.com/photo-1633681122987-1d5c2f9afa47?w=800&q=80",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80",
  ],
};

let imgCounter = { MASCULINE: 0, FEMININE: 0, UNISEX: 0 };
const getImg = (g: SalonGender) => {
  const imgs = IMG[g];
  return imgs[imgCounter[g]++ % imgs.length];
};

// Templates de serviços
const SVC_IMG = {
  corte: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&q=80",
  barba: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80",
  escova: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
  coloracao: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80",
  manicure: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
  sobrancelha: "https://images.unsplash.com/photo-1588516903720-8ceb67f96d3b?w=400&q=80",
  hidratacao: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80",
};

const SERVICES = {
  MASCULINE: [
    { name: "Corte Masculino", description: "Corte personalizado com as últimas tendências masculinas.", priceInCents: 5500, imageUrl: SVC_IMG.corte },
    { name: "Barba", description: "Modelagem completa com navalha e produtos premium.", priceInCents: 4000, imageUrl: SVC_IMG.barba },
    { name: "Corte + Barba", description: "Combo completo: corte e modelagem de barba.", priceInCents: 8500, imageUrl: SVC_IMG.corte },
    { name: "Pézinho", description: "Acabamento perfeito no contorno do cabelo.", priceInCents: 3000, imageUrl: SVC_IMG.corte },
    { name: "Sobrancelha Masculina", description: "Design de sobrancelha para realçar o visual.", priceInCents: 2000, imageUrl: SVC_IMG.sobrancelha },
    { name: "Hidratação Masculina", description: "Tratamento hidratante para cabelo e barba.", priceInCents: 4500, imageUrl: SVC_IMG.hidratacao },
  ],
  FEMININE: [
    { name: "Corte Feminino", description: "Corte personalizado para todos os tipos de cabelo.", priceInCents: 7000, imageUrl: SVC_IMG.corte },
    { name: "Escova", description: "Escova modeladora com produtos profissionais.", priceInCents: 6000, imageUrl: SVC_IMG.escova },
    { name: "Coloração", description: "Coloração completa com tintas de alta qualidade.", priceInCents: 15000, imageUrl: SVC_IMG.coloracao },
    { name: "Hidratação", description: "Tratamento de hidratação profunda para cabelos ressecados.", priceInCents: 8000, imageUrl: SVC_IMG.hidratacao },
    { name: "Sobrancelha", description: "Design e modelagem de sobrancelha com linha ou pinça.", priceInCents: 3000, imageUrl: SVC_IMG.sobrancelha },
    { name: "Progressiva", description: "Alisamento progressivo com produtos de qualidade.", priceInCents: 20000, imageUrl: SVC_IMG.escova },
    { name: "Manicure", description: "Cuidados completos para unhas das mãos.", priceInCents: 4000, imageUrl: SVC_IMG.manicure },
    { name: "Pedicure", description: "Cuidados completos para unhas dos pés.", priceInCents: 5000, imageUrl: SVC_IMG.manicure },
  ],
  UNISEX: [
    { name: "Corte Masculino", description: "Corte personalizado masculino.", priceInCents: 5500, imageUrl: SVC_IMG.corte },
    { name: "Corte Feminino", description: "Corte personalizado para todos os tipos de cabelo.", priceInCents: 7000, imageUrl: SVC_IMG.corte },
    { name: "Barba", description: "Modelagem completa com navalha e produtos premium.", priceInCents: 4000, imageUrl: SVC_IMG.barba },
    { name: "Escova", description: "Escova modeladora profissional.", priceInCents: 6000, imageUrl: SVC_IMG.escova },
    { name: "Coloração", description: "Coloração completa com tintas de alta qualidade.", priceInCents: 15000, imageUrl: SVC_IMG.coloracao },
    { name: "Sobrancelha", description: "Design de sobrancelha para homens e mulheres.", priceInCents: 2500, imageUrl: SVC_IMG.sobrancelha },
    { name: "Hidratação", description: "Tratamento hidratante para todo tipo de cabelo.", priceInCents: 6000, imageUrl: SVC_IMG.hidratacao },
    { name: "Manicure", description: "Cuidados completos para unhas das mãos.", priceInCents: 4000, imageUrl: SVC_IMG.manicure },
  ],
};

// Dados reais coletados via web
const SALONS: Array<{
  name: string;
  address: string;
  city: string;
  phone: string;
  gender: SalonGender;
  description: string;
}> = [
  // === CARAGUATATUBA ===
  {
    name: "Barbearia do Carioca",
    address: "Av. Prisciliana de Castilho, 374, Sala 8",
    city: "Caraguatatuba",
    phone: "(12) 98116-1817",
    gender: SalonGender.MASCULINE,
    description: "Barbearia bem avaliada com múltiplos profissionais. Especialistas em corte, barba, design de sobrancelha e escova progressiva.",
  },
  {
    name: "Barbearia Holyster",
    address: "Rua Altino Arantes, 685",
    city: "Caraguatatuba",
    phone: "(12) 99613-9376",
    gender: SalonGender.MASCULINE,
    description: "Barbearia no centro de Caraguatatuba com atendimento especializado em cortes modernos e clássicos.",
  },
  {
    name: "Barbearia Henrique",
    address: "Av. Marechal Deodoro da Fonseca, 760 - Tingá",
    city: "Caraguatatuba",
    phone: "(12) 98849-4016",
    gender: SalonGender.MASCULINE,
    description: "Barbearia no bairro Tingá especializada em cortes masculinos adulto e infantil.",
  },
  {
    name: "Detroit Barbearia",
    address: "Av. Arthur Costa Filho, 937, Loja 41A",
    city: "Caraguatatuba",
    phone: "(12) 98105-1344",
    gender: SalonGender.MASCULINE,
    description: "Barbearia moderna no centro comercial de Caraguatatuba. Atendimento por WhatsApp.",
  },
  {
    name: "Guel Barber Shop",
    address: "Rua Ismael Iglesias, 135 - Barranco Alto",
    city: "Caraguatatuba",
    phone: "(12) 98215-2956",
    gender: SalonGender.MASCULINE,
    description: "Barbearia no bairro Barranco Alto, em funcionamento desde 2013. Tradição e qualidade.",
  },
  {
    name: "Nenê Mafra Coiffeur",
    address: "Av. Anchieta, 325 - Centro",
    city: "Caraguatatuba",
    phone: "(12) 3882-2800",
    gender: SalonGender.UNISEX,
    description: "Salão unissex no centro de Caraguatatuba com serviços completos de cabelo e estética.",
  },
  {
    name: "Channel Beauty Hair",
    address: "Rua Santos Dumont, 226 - Centro",
    city: "Caraguatatuba",
    phone: "(12) 3881-1033",
    gender: SalonGender.FEMININE,
    description: "Salão de beleza feminino no centro de Caraguatatuba. Especialidade em coloração e tratamentos capilares.",
  },
  {
    name: "Kátia Cabeleireira",
    address: "Av. Anchieta, 818 - Centro",
    city: "Caraguatatuba",
    phone: "(12) 3882-1825",
    gender: SalonGender.FEMININE,
    description: "Cabeleireira com anos de experiência no centro de Caraguatatuba. Atendimento personalizado.",
  },
  // === UBATUBA ===
  {
    name: "Classic Barber",
    address: "Rua Conceição, 535 - Centro",
    city: "Ubatuba",
    phone: "(12) 99105-4072",
    gender: SalonGender.MASCULINE,
    description: "Eleita melhor barbearia de Ubatuba por 5 anos consecutivos. Em funcionamento desde 2017. Equipe de 4 barbeiros profissionais especializados em degradê e acabamento.",
  },
  {
    name: "Barbearia Anjos da Barba",
    address: "Av. Rio Grande do Sul, 592 - Centro",
    city: "Ubatuba",
    phone: "(12) 99200-9806",
    gender: SalonGender.MASCULINE,
    description: "Barbearia no centro de Ubatuba especializada em cortes masculinos, barba com toalha quente e design de barba.",
  },
  {
    name: "Barbearia Mendes Ubatuba",
    address: "Rua Dr. Esteves da Silva, 166 - Centro",
    city: "Ubatuba",
    phone: "(19) 98335-5492",
    gender: SalonGender.MASCULINE,
    description: "Barbearia com atendimento de segunda a sábado. Corte, barba com toalha quente e acabamento.",
  },
  {
    name: "Fany Cabeleireiros",
    address: "Rua Dr. Esteves da Silva, 120 - Centro",
    city: "Ubatuba",
    phone: "(12) 3832-2374",
    gender: SalonGender.FEMININE,
    description: "Salão de cabeleireiro no centro de Ubatuba com atendimento feminino completo.",
  },
  {
    name: "La Belle Espaço de Beleza",
    address: "Rua Cunhambebe, 434, Loja 3 - Centro",
    city: "Ubatuba",
    phone: "(12) 3832-5627",
    gender: SalonGender.FEMININE,
    description: "Espaço de beleza completo no centro de Ubatuba. Coloração, escova e tratamentos capilares.",
  },
  {
    name: "Nill Cabeleireiro Unissex",
    address: "Rua Salvador Correia, 20 - Centro",
    city: "Ubatuba",
    phone: "(12) 3833-3131",
    gender: SalonGender.UNISEX,
    description: "Salão unissex no centro de Ubatuba atendendo homens e mulheres com qualidade.",
  },
  // === ILHABELA ===
  {
    name: "Sete Barbas Barber Studio",
    address: "Av. Princesa Isabel, 1319, Loja 3 - Perequê",
    city: "Ilhabela",
    phone: "(12) 99686-4514",
    gender: SalonGender.MASCULINE,
    description: "Barbearia premium no bairro Perequê. Funciona de segunda a sábado das 9h às 20h. Especialistas em barba com toalha quente.",
  },
  {
    name: "Barbearia do Renato",
    address: "Rua Sergio Rodrigues, 40 - Perequê",
    city: "Ilhabela",
    phone: "(12) 99165-0677",
    gender: SalonGender.MASCULINE,
    description: "Barbearia tradicional no bairro Perequê de Ilhabela. Cortes masculinos e barba.",
  },
  {
    name: "Ilhabela Beauty",
    address: "Estrada do Camarão, 194 - Barra Velha",
    city: "Ilhabela",
    phone: "(12) 98178-6799",
    gender: SalonGender.UNISEX,
    description: "Salão de beleza unissex no bairro Barra Velha. Atende homens e mulheres com todos os serviços.",
  },
  {
    name: "Bella Hair Cabeleireiros",
    address: "Rua Prefeito Mariano P A Carvalho, 32 - Perequê",
    city: "Ilhabela",
    phone: "(12) 3896-5222",
    gender: SalonGender.FEMININE,
    description: "Salão feminino no bairro Perequê de Ilhabela. Coloração, escova e tratamentos capilares.",
  },
  {
    name: "Guida Cabeleireiros",
    address: "Av. Força Expedicionária Brasileira, 13 - Morro Cantagalo",
    city: "Ilhabela",
    phone: "(12) 3896-3479",
    gender: SalonGender.FEMININE,
    description: "Salão de cabeleireiro e estética no Morro Cantagalo. Coloração, escova e estética.",
  },
  {
    name: "Ideal Cabeleireiros",
    address: "Rua Nova 2, 416, Loja 4 - Centro",
    city: "Ilhabela",
    phone: "(12) 3896-5274",
    gender: SalonGender.UNISEX,
    description: "Cabeleireiro unissex no centro de Ilhabela com atendimento completo para toda a família.",
  },
  {
    name: "Beleza e Cia",
    address: "Av. Ernesto de Oliveira, 91, Loja 3 - Barra Velha",
    city: "Ilhabela",
    phone: "(12) 3896-3851",
    gender: SalonGender.FEMININE,
    description: "Salão de beleza no bairro Barra Velha de Ilhabela. Coloração, escova e tratamentos capilares.",
  },
  // === SÃO SEBASTIÃO ===
  {
    name: "Yellodoor Barbearia",
    address: "Rua Antônio Cândido, 228 - Centro",
    city: "São Sebastião",
    phone: "(12) 98119-2891",
    gender: SalonGender.MASCULINE,
    description: "Barbearia premiada com nota 5.0 e 174 avaliações. Acessível para cadeirantes, aceita cartão, Wi-Fi disponível. Especialistas em barboterapia.",
  },
  {
    name: "Salão Atlântico",
    address: "Rua Cidade de Santos, 159 - Centro",
    city: "São Sebastião",
    phone: "(12) 99105-9153",
    gender: SalonGender.UNISEX,
    description: "Salão unissex com 4.9 estrelas e 261 avaliações. Atende homens e mulheres com corte, barba, escova e coloração.",
  },
  {
    name: "Studio Andréia Reis",
    address: "Rua Capitão Luiz Soares, 120",
    city: "São Sebastião",
    phone: "(12) 3892-4455",
    gender: SalonGender.FEMININE,
    description: "Studio especializado em colorimetria e visagismo com produtos internacionais premium. Referência em loiros e tratamentos especiais.",
  },
  {
    name: "Delta Cabeleireiros",
    address: "Rua Marechal Deodoro da Fonseca, 11 - Centro",
    city: "São Sebastião",
    phone: "(12) 3893-1873",
    gender: SalonGender.UNISEX,
    description: "Salão de cabeleireiro no centro de São Sebastião com atendimento completo para toda a família.",
  },
  {
    name: "Juquehy Beauty Center",
    address: "Av. Mãe Bernarda, 800 - Juquehy",
    city: "São Sebastião",
    phone: "(12) 3863-1020",
    gender: SalonGender.FEMININE,
    description: "Salão no bairro Juquehy com ambiente climatizado. Especialidade em spa capilar, escova, coloração e pacote para noivas.",
  },
  {
    name: "Espaço Bela Mares",
    address: "Av. Walkir Vergani, 1500 - Boiçucanga",
    city: "São Sebastião",
    phone: "(12) 99742-1188",
    gender: SalonGender.FEMININE,
    description: "Salão de beleza e estética no bairro Boiçucanga. Manicure, pedicure, unhas de gel e fibra de vidro.",
  },
  // === BERTIOGA ===
  {
    name: "Don Fernando Barbearia",
    address: "Av. Anchieta, 636 - Centro",
    city: "Bertioga",
    phone: "(11) 99226-7846",
    gender: SalonGender.MASCULINE,
    description: "Barbearia premium no centro de Bertioga em funcionamento desde 2016. Destaque em consultoria de imagem masculina, barboterapia e mechas.",
  },
  {
    name: "Barbearia Reallcy",
    address: "Av. 19 de Maio, 139, Loja 5 - Jardim Albatroz",
    city: "Bertioga",
    phone: "(13) 98877-3322",
    gender: SalonGender.MASCULINE,
    description: "Barbearia no bairro Jardim Albatroz de Bertioga, em funcionamento desde 2012. Tradição em cortes e barba.",
  },
  {
    name: "Salão Estrela",
    address: "Av. 19 de Maio, 515 - Jardim Albatroz",
    city: "Bertioga",
    phone: "(13) 3317-5464",
    gender: SalonGender.FEMININE,
    description: "Salão de cabeleireiro feminino no Jardim Albatroz. Corte, coloração, escova, manicure e pedicure.",
  },
  {
    name: "Renan Cabeleireiros",
    address: "Av. Anchieta, 1737 - Centro",
    city: "Bertioga",
    phone: "(13) 3317-2114",
    gender: SalonGender.UNISEX,
    description: "Salão de cabeleireiro unissex no centro de Bertioga. Atendimento completo para homens e mulheres.",
  },
  {
    name: "Sinara Cabeleireiros",
    address: "Av. Anchieta, 400 - Centro",
    city: "Bertioga",
    phone: "(13) 3317-7036",
    gender: SalonGender.FEMININE,
    description: "Salão de cabeleireiro feminino no centro de Bertioga com atendimento personalizado.",
  },
  {
    name: "Pierres Cabeleireiros",
    address: "Av. Dr. Leonardo de Bonna, 113 - Vila Itapanhau",
    city: "Bertioga",
    phone: "(13) 3317-2506",
    gender: SalonGender.UNISEX,
    description: "Salão de cabeleireiro unissex no bairro Vila Itapanhau. Coloração, escova e corte para toda a família.",
  },
  {
    name: "Espaço M e F",
    address: "Rua Miguel Seiade Bichir, 387 - Vila Agão",
    city: "Bertioga",
    phone: "(13) 3317-5686",
    gender: SalonGender.UNISEX,
    description: "Salão masculino e feminino no bairro Vila Agão. Corte, coloração, escova e muito mais.",
  },
];

async function main() {
  console.log("🌊 Populando banco com estabelecimentos reais do Litoral de SP...\n");

  await prisma.barbershopService.deleteMany();
  await prisma.barbershop.deleteMany();

  for (const salon of SALONS) {
    const barbershop = await prisma.barbershop.create({
      data: {
        name: salon.name,
        address: salon.address,
        city: salon.city,
        description: salon.description,
        imageUrl: getImg(salon.gender),
        phones: [salon.phone],
        gender: salon.gender,
      },
    });

    const services = SERVICES[salon.gender];
    for (const svc of services) {
      await prisma.barbershopService.create({
        data: { ...svc, barbershopId: barbershop.id },
      });
    }

    const icon = salon.gender === "MASCULINE" ? "💈" : salon.gender === "FEMININE" ? "✂️" : "🏪";
    console.log(`${icon} ${salon.name} — ${salon.city}`);
  }

  console.log(`\n✅ ${SALONS.length} estabelecimentos criados com sucesso!`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
