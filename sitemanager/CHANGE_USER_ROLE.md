# Cum să Schimbi Rolul unui Utilizator

## Metoda 1: Prisma Studio (Recomandat - Interfață Grafică)

### Pasul 1: Pornește Prisma Studio

În terminal, rulează:

```bash
npm run prisma:studio
```

Aceasta va deschide Prisma Studio în browser la: **http://localhost:5555**

### Pasul 2: Găsește Utilizatorul

1. În Prisma Studio, click pe modelul **"User"** din lista din stânga
2. Vei vedea toți utilizatorii din baza de date
3. Caută utilizatorul după email (folosește search-ul din dreapta sus)
4. Click pe utilizatorul pe care vrei să-l modifici

### Pasul 3: Schimbă Rolul

1. Click pe câmpul **"role"** (va deveni editabil)
2. Schimbă valoarea la unul dintre:
   - `manager`
   - `supervisor`
   - `user`
3. Click pe butonul **"Save 1 change"** (sus în dreapta)

### Pasul 4: Verifică

1. Deloghează-te din aplicație (dacă ești logat)
2. Loghează-te din nou cu același email
3. Ar trebui să vezi permisiunile noului rol

---

## Metoda 2: Direct în Supabase (Alternativă)

Dacă preferi să folosești interfața Supabase:

1. Mergi la https://supabase.com/dashboard
2. Selectează proiectul tău
3. Click pe **"Table Editor"** din meniul stâng
4. Click pe tabelul **"User"**
5. Găsește utilizatorul după email
6. Click pe câmpul **"role"** și schimbă-l
7. Click **"Save"**

---

## Metoda 3: Script Node.js (Pentru Automatizare)

Poți crea un script rapid pentru a schimba rolul:

```bash
# Creează un fișier change-role.js
cat > change-role.js << 'EOF'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function changeUserRole(email, newRole) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: newRole }
    })
    console.log(`✓ Rolul utilizatorului ${email} a fost schimbat la: ${newRole}`)
  } catch (error) {
    console.error('Eroare:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Folosește: node change-role.js email@example.com manager
const email = process.argv[2]
const role = process.argv[3]

if (!email || !role) {
  console.log('Folosire: node change-role.js email@example.com manager')
  process.exit(1)
}

if (!['manager', 'supervisor', 'user'].includes(role)) {
  console.log('Rol invalid. Folosește: manager, supervisor, sau user')
  process.exit(1)
}

changeUserRole(email, role)
EOF

# Rulează script-ul
node change-role.js your-email@example.com manager
```

---

## Roluri Disponibile

- **manager**: Acces complet - poate crea, edita, șterge tot
- **supervisor**: Poate adăuga poze la snags, schimba status, dar nu poate edita detalii
- **user**: Doar vizualizare - nu poate edita nimic

---

## Important

După ce schimbi rolul:
1. **Deloghează-te** din aplicație
2. **Loghează-te din nou** pentru ca noul rol să fie încărcat în sesiune
3. Verifică că permisiunile corespund noului rol

