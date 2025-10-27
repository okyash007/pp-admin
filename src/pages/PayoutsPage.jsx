import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download
} from 'lucide-react'

const payoutStats = [
  {
    name: 'Total Payouts',
    value: '$125,430',
    change: '+12.5%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Pending Payouts',
    value: '$8,240',
    change: '+2.1%',
    changeType: 'positive',
    icon: Clock,
  },
  {
    name: 'Completed Payouts',
    value: '$117,190',
    change: '+15.3%',
    changeType: 'positive',
    icon: CheckCircle,
  },
  {
    name: 'Failed Payouts',
    value: '$1,200',
    change: '-5.2%',
    changeType: 'negative',
    icon: XCircle,
  },
]

const recentPayouts = [
  {
    id: 1,
    creator: 'John Doe',
    amount: '$2,450',
    status: 'completed',
    date: '2024-01-15',
    method: 'Bank Transfer'
  },
  {
    id: 2,
    creator: 'Jane Smith',
    amount: '$1,890',
    status: 'pending',
    date: '2024-01-14',
    method: 'PayPal'
  },
  {
    id: 3,
    creator: 'Mike Johnson',
    amount: '$3,200',
    status: 'completed',
    date: '2024-01-13',
    method: 'Bank Transfer'
  },
  {
    id: 4,
    creator: 'Sarah Wilson',
    amount: '$950',
    status: 'failed',
    date: '2024-01-12',
    method: 'PayPal'
  },
  {
    id: 5,
    creator: 'Alex Brown',
    amount: '$1,750',
    status: 'pending',
    date: '2024-01-11',
    method: 'Bank Transfer'
  },
]

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100'
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'failed':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground">
            Manage creator payouts and financial transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {payoutStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className={stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
          <CardDescription>
            Latest payout transactions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{payout.creator}</p>
                    <p className="text-sm text-muted-foreground">{payout.method}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{payout.amount}</p>
                    <p className="text-sm text-muted-foreground">{payout.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                    {payout.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              Payouts waiting for approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Jane Smith - $1,890</span>
                <Button size="sm">Approve</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Alex Brown - $1,750</span>
                <Button size="sm">Approve</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed Payouts</CardTitle>
            <CardDescription>
              Payouts that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sarah Wilson - $950</span>
                <Button size="sm" variant="outline">Retry</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
