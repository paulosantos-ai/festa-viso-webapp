# 🌐 Festa do Viso - Web App (iOS/Android)

Progressive Web App (PWA) que funciona **100% offline** em iOS e Android.

## ✨ Características

- ✅ Funciona em iPhone, iPad e Android
- ✅ Instalável no ecrã principal (sem App Store)
- ✅ Funciona 100% offline depois de instalada
- ✅ Dados guardados no dispositivo (localStorage)
- ✅ Interface otimizada para mobile
- ✅ Todas as funcionalidades da app Android

## 📱 Como Instalar no iPhone/iPad

### Método 1: Diretamente do Safari

1. Abre o Safari e vai para: `https://seuservidor.com/festa-viso`
2. Toca no botão **Partilhar** (ícone quadrado com seta para cima)
3. Desliza e toca em **"Adicionar ao Ecrã Principal"**
4. Toca em **"Adicionar"**
5. A app aparece no teu ecrã principal como uma app normal

### Método 2: Usando ficheiros locais

Se não tiveres servidor web, podes usar o GitHub Pages gratuitamente:

1. Faz upload destes ficheiros para um repositório GitHub
2. Vai a Settings → Pages → Source: main branch
3. Acede ao URL fornecido (ex: `https://username.github.io/repo`)
4. Segue os passos do Método 1

## 🌐 Como Hospedar (Gratuito)

### Opção 1: GitHub Pages (Recomendado)

```bash
# Na pasta web-app
git init
git add .
git commit -m "Initial commit"
gh repo create festa-viso-webapp --public --source=. --remote=origin
git push -u origin main

# Ativar GitHub Pages
gh repo edit --enable-pages --pages-branch=main
```

Depois de 1-2 minutos, a app estará disponível em:
`https://paulosantos-ai.github.io/festa-viso-webapp`

### Opção 2: Netlify

1. Vai a [netlify.com](https://netlify.com)
2. Arrasta a pasta `web-app` para o site
3. URL gerado automaticamente (ex: `festadoviso.netlify.app`)

### Opção 3: Vercel

```bash
npm install -g vercel
cd web-app
vercel
```

## 📂 Estrutura de Ficheiros

```
web-app/
├── index.html      # Interface principal
├── app.js          # Lógica da aplicação
├── manifest.json   # Configuração PWA
├── sw.js           # Service Worker (offline)
├── icon-192.png    # Ícone pequeno
├── icon-512.png    # Ícone grande
└── README.md       # Este ficheiro
```

## 🎨 Funcionalidades

### 1️⃣ Sorteio
- Seletor de folha ativa
- Grid 7×7 com números 1-49 visíveis
- Verde = disponível, Cinza = ocupado
- Diálogo de registo com validação

### 2️⃣ Vencedores
- Lista de vencedores ordenada por data
- Cards com todas as informações

### 3️⃣ Admin
- Login: `admin` / `admin123`
- Estatísticas completas
- Gestão de folhas (criar, ativar/desativar, eliminar)
- Registar vencedores com validação

## 💾 Armazenamento

Todos os dados são guardados em **localStorage**:
- `folhas` - Lista de folhas
- `registos` - Números registados
- `vencedores` - Histórico de vencedores
- `adminLoggedIn` - Estado de login

## 🔒 Dados Offline

A app funciona **100% offline** depois de aberta pela primeira vez:
- Service Worker guarda todos os ficheiros
- Dados persistem no dispositivo
- Não precisa de internet

## 🚀 Teste Local

Para testar localmente:

```bash
# Python 3
cd web-app
python3 -m http.server 8000

# Ou Node.js
npx http-server -p 8000
```

Depois abre: `http://localhost:8000`

## 📱 Compatibilidade

- ✅ iOS 11.3+ (Safari)
- ✅ Android 5.0+ (Chrome)
- ✅ Tablets iPad/Android
- ✅ Desktop (Chrome, Firefox, Safari, Edge)

## 🎯 Próximos Passos

1. **Publicar online:**
   ```bash
   cd web-app
   gh repo create festa-viso-webapp --public --source=. --remote=origin
   git push -u origin main
   gh repo edit --enable-pages --pages-branch=main
   ```

2. **Partilhar URL com utilizadores**

3. **Instruir para "Adicionar ao Ecrã Principal"**

## 🆚 Web App vs App Android

| Característica | Web App | Android Nativo |
|---------------|---------|----------------|
| iOS | ✅ Sim | ❌ Não |
| Android | ✅ Sim | ✅ Sim |
| Instalação | Safari/Chrome | Google Play / APK |
| Offline | ✅ Sim | ✅ Sim |
| Atualizações | Automáticas | Manual |
| Tamanho | ~50KB | ~15MB |
| Notificações | ⚠️ Limitadas | ✅ Completas |

## 📞 Suporte

Para hospedar a app gratuitamente, recomendo **GitHub Pages** (mais simples e confiável).

---

**Made with ❤️ for Festa do Viso**
