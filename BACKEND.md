# Backend de mídias

## Configuração

1. Copie `.env.example` para `.env`.
2. Preencha:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Rode:

```bash
npm install
npm start
```

O site fica em `http://localhost:3000` e o painel em `http://localhost:3000/admin`.

## Seed inicial

Na primeira inicialização com o MongoDB vazio, o backend cadastra automaticamente no banco as mídias que já existem em `assets/`:

- fotos do carrossel
- imagem do kimono
- ícone do Threads
- vídeo da galeria

Se as credenciais do Cloudinary estiverem preenchidas no `.env`, essas mídias iniciais também são enviadas para o Cloudinary e salvas no MongoDB com a URL final. Sem essas credenciais, elas entram no MongoDB apontando para os arquivos locais. Novos uploads feitos pelo painel admin exigem Cloudinary configurado.
