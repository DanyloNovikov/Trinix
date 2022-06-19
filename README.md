This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

---

### Set .env.development

    NEXT_PUBLIC_NETWORK_ID=5777
    NEXT_PUBLIC_TARGET_CHAIN_ID=1337
    NEXT_PUBLIC_PINATA_DOMAIN=https://gateway.pinata.cloud
    
    <!--something random password with 32 characters-->
    SECRET_COOKIE_PASSWORD= 
    
    <!--pinata key-->
    PINATA_API_KEY= 
    PINATA_API_SECRECT=

---

### setup Blockchain

 1. start Ganache with project setting
 2. run command:

```bash
npm install

truffle migrate

npm run dev
# or
yarn dev
```

