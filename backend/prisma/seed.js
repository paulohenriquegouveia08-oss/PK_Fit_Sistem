const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Senha do admin global: 15Paulohg
  const adminPasswordHash = await bcrypt.hash('15Paulohg', 12);

  // Criar ou atualizar admin global
  const adminGlobal = await prisma.user.upsert({
    where: { email: 'paulohenriquegouveia08@gmail.com' },
    update: {
      password_hash: adminPasswordHash,
      role: 'ADMIN_GLOBAL',
      first_access: false,
    },
    create: {
      name: 'Paulo Henrique',
      email: 'paulohenriquegouveia08@gmail.com',
      password_hash: adminPasswordHash,
      role: 'ADMIN_GLOBAL',
      first_access: false,
    },
  });

  console.log('✅ Admin global criado:', adminGlobal.email);

  // Criar academia de exemplo
  const academiaDemo = await prisma.academy.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      name: 'Academia Demo',
      cnpj: '00.000.000/0001-00',
    },
  });

  console.log('✅ Academia demo criada:', academiaDemo.name);

  // Criar usuários de exemplo para cada role
  const usersToCreate = [
    {
      name: 'Admin Academia Demo',
      email: 'admin@academiademo.com',
      role: 'ADMIN_ACADEMIA',
      academy_id: academiaDemo.id,
    },
    {
      name: 'Professor Demo',
      email: 'professor@academiademo.com',
      role: 'PROFESSOR',
      academy_id: academiaDemo.id,
    },
    {
      name: 'Personal Demo',
      email: 'personal@academiademo.com',
      role: 'PERSONAL',
      academy_id: academiaDemo.id,
    },
    {
      name: 'Aluno Demo',
      email: 'aluno@academiademo.com',
      role: 'ALUNO',
      academy_id: academiaDemo.id,
    },
  ];

  for (const userData of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`✅ Usuário criado: ${user.email} (${user.role}) - Primeiro acesso pendente`);
  }

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais do Admin Global:');
  console.log('   Email: paulohenriquegouveia08@gmail.com');
  console.log('   Senha: 15Paulohg');
  console.log('\n📋 Usuários de teste (sem senha - primeiro acesso):');
  console.log('   - admin@academiademo.com');
  console.log('   - professor@academiademo.com');
  console.log('   - personal@academiademo.com');
  console.log('   - aluno@academiademo.com');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
