# Dockerfile untuk backend LaporKu — dipakai Back4app Containers (atau platform Docker lain).
# Tidak mempengaruhi development lokal sama sekali — file ini hanya dibaca saat platform
# hosting melakukan build container, bukan saat npm run dev di lokal.

FROM node:20-alpine

WORKDIR /app

# Copy package files dulu (caching layer Docker, build jadi lebih cepat di redeploy berikutnya)
COPY package*.json ./
COPY prisma ./prisma

RUN npm install --omit=dev
RUN npx prisma generate

# Copy sisa source code
COPY . .

# Port yang dipakai backend (sesuai env.PORT, platform akan override via env var PORT)
EXPOSE 3001

CMD ["npm", "start"]