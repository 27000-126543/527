import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import sellerRoutes from './routes/sellers.js'
import reviewerRoutes from './routes/reviewer.js'
import inspectorRoutes from './routes/inspector.js'
import ipOwnerRoutes from './routes/ip-owner.js'
import financeRoutes from './routes/finance.js'
import notificationRoutes from './routes/notifications.js'

const __filename = fileURLToPath(import.meta.url)
void path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/seller', sellerRoutes)
app.use('/api/reviewer', reviewerRoutes)
app.use('/api/inspector', inspectorRoutes)
app.use('/api/ip-owner', ipOwnerRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/api/products', (req: Request, res: Response): void => {
  import('./db.js').then(({ products, users }) => {
    const data = products.map(p => {
      const seller = users.find((u: any) => u.id === p.seller_id)
      return {
        ...p,
        seller_name: seller?.company_name || seller?.username || '',
      }
    })
    res.json({ success: true, data })
  })
})

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    void next
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  void next
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
