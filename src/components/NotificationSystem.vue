<template>
  <div class="max-w-[1000px] mx-auto">
    <!-- Notification Settings -->
    <Card class="mb-4">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">Bill Reminders</div>
                <div class="text-xs text-muted-foreground">Get notified about upcoming bills</div>
              </div>
              <Switch v-model:checked="notificationSettings.billReminders" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">Low Balance Alerts</div>
                <div class="text-xs text-muted-foreground">Alert when account balance is low</div>
              </div>
              <Switch v-model:checked="notificationSettings.lowBalanceAlerts" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">Budget Warnings</div>
                <div class="text-xs text-muted-foreground">Warn when approaching budget limits</div>
              </div>
              <Switch v-model:checked="notificationSettings.budgetWarnings" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">Subscription Reminders</div>
                <div class="text-xs text-muted-foreground">Remind about subscription renewals</div>
              </div>
              <Switch v-model:checked="notificationSettings.subscriptionReminders" />
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">Goal Milestones</div>
                <div class="text-xs text-muted-foreground">Celebrate when reaching savings goals</div>
              </div>
              <Switch v-model:checked="notificationSettings.goalMilestones" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">Unusual Spending</div>
                <div class="text-xs text-muted-foreground">Alert for unusual spending patterns</div>
              </div>
              <Switch v-model:checked="notificationSettings.unusualSpending" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">Weekly Summary</div>
                <div class="text-xs text-muted-foreground">Weekly financial summary report</div>
              </div>
              <Switch v-model:checked="notificationSettings.weeklySummary" />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">Push Notifications</div>
                <div class="text-xs text-muted-foreground">Enable browser push notifications</div>
              </div>
              <Switch
                :checked="notificationSettings.pushNotifications"
                @update:checked="togglePushNotifications"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Active Notifications -->
    <Card class="mb-4">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Active Notifications</CardTitle>
          <Button variant="ghost" size="sm" @click="markAllAsRead">Mark All Read</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="activeNotifications.length === 0" class="text-center text-muted-foreground py-10">
          <Bell class="w-16 h-16 mx-auto mb-4 opacity-40" />
          <div class="text-lg font-semibold">No Active Notifications</div>
          <div class="text-xs">
            All caught up! You'll be notified of important updates here.
          </div>
        </div>

        <div
          v-for="notification in activeNotifications"
          :key="notification.id"
          class="p-3 rounded-lg border-l-4 transition-colors mb-2 cursor-pointer hover:bg-muted/50"
          :class="{
            'border-l-primary bg-primary/5': !notification.read,
            'border-l-transparent': notification.read,
          }"
          @click="markAsRead(notification)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
              :class="getAvatarBgClass(notification.color)"
            >
              <component :is="getIconComponent(notification.icon)" class="w-5 h-5" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold">{{ notification.title }}</div>
              <div class="text-xs text-muted-foreground">{{ notification.message }}</div>
              <div class="text-xs text-muted-foreground/60">{{
                formatTimeAgo(notification.createdAt)
              }}</div>
            </div>

            <div v-if="notification.amount" class="text-sm font-semibold shrink-0">
              {{ formatCurrency(notification.amount) }}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              @click.stop="dismissNotification(notification)"
            >
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Upcoming Bills -->
    <Card class="mb-4">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Upcoming Bills</CardTitle>
          <Button variant="ghost" size="sm" @click="showAddBillSheet = true">Add Bill</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          v-for="bill in upcomingBills"
          :key="bill.id"
          class="mb-4 rounded-lg border p-4 transition-transform hover:-translate-y-0.5"
        >
          <div class="flex items-center">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white mr-4 shrink-0"
              :class="getAvatarBgClass(bill.color)"
            >
              <component :is="getIconComponent(bill.icon)" class="w-5 h-5" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="text-base font-medium">{{ bill.name }}</div>
              <div class="text-xs text-muted-foreground">
                {{ bill.category }} &bull; {{ bill.frequency }}
              </div>
            </div>

            <div class="text-right shrink-0">
              <div class="text-lg font-bold">{{ formatCurrency(bill.amount) }}</div>
              <div class="text-xs" :class="getDueDateClass(bill.dueDate)">
                Due {{ formatDueDate(bill.dueDate) }}
              </div>
            </div>
          </div>

          <div class="flex gap-2 mt-3">
            <Button variant="ghost" size="sm" @click="markBillAsPaid(bill)">
              <CheckCircle2 class="w-4 h-4 mr-1" />
              Mark Paid
            </Button>
            <Button variant="ghost" size="sm" @click="editBill(bill)">
              <Pencil class="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="confirmDeleteBill(bill)">
              <Trash2 class="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Notification History -->
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="relative border-l-2 border-border ml-5 pl-6 space-y-6">
          <div
            v-for="notification in notificationHistory"
            :key="notification.id"
            class="relative"
          >
            <!-- Timeline dot -->
            <div
              class="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center"
              :class="getAvatarBgClass(notification.color)"
            >
            </div>

            <div>
              <div class="text-sm font-semibold">{{ notification.title }}</div>
              <div class="text-xs text-muted-foreground/60">
                {{ formatDateTime(notification.createdAt) }}
              </div>
              <div class="text-xs text-muted-foreground mt-1">{{ notification.message }}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Add Bill Sheet (bottom) -->
    <Sheet v-model:open="showAddBillSheet">
      <SheetContent side="bottom" class="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Bill Reminder</SheetTitle>
          <SheetDescription>Set up a new recurring bill reminder.</SheetDescription>
        </SheetHeader>

        <div class="space-y-4 py-4 max-w-md mx-auto">
          <div class="space-y-2">
            <label class="text-sm font-medium">Bill Name</label>
            <Input v-model="newBill.name" placeholder="Bill Name" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Category</label>
            <Select v-model="newBill.category">
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="cat in billCategories" :key="cat" :value="cat">
                  {{ cat }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">&#8369;</span>
              <Input
                v-model.number="newBill.amount"
                type="number"
                step="0.01"
                class="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Due Date</label>
            <Input v-model="newBill.dueDate" type="date" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Frequency</label>
            <Select v-model="newBill.frequency">
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="freq in frequencyOptions" :key="freq" :value="freq">
                  {{ freq }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Remind me (days before)</label>
            <Input
              v-model.number="newBill.reminderDays"
              type="number"
              min="1"
              max="30"
              placeholder="3"
            />
          </div>
        </div>

        <SheetFooter class="max-w-md mx-auto">
          <Button variant="outline" @click="showAddBillSheet = false">Cancel</Button>
          <Button @click="addBill">Add Bill</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

    <!-- Delete Bill Confirmation Dialog -->
    <Dialog v-model:open="showDeleteBillConfirm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Bill</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {{ billToDelete?.name }}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteBillConfirm = false">Cancel</Button>
          <Button variant="destructive" @click="deleteBill">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toast } from 'vue-sonner';

import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Switch } from 'src/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from 'src/components/ui/sheet';
import { Input } from 'src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';

import {
  AlertTriangle,
  CreditCard,
  Wallet,
  Flag,
  CheckCircle2,
  Bell,
  AlertCircle,
  Film,
  Zap,
  Wifi,
  X,
  Pencil,
  Trash2,
  Shield,
  Landmark,
  Home,
  ListVideo,
  Receipt,
  BarChart3,
  BellOff,
} from 'lucide-vue-next';

// Icon mapping from Quasar material icons to Lucide components
const iconMap: Record<string, any> = {
  warning: AlertTriangle,
  payment: CreditCard,
  account_balance_wallet: Wallet,
  flag: Flag,
  check: CheckCircle2,
  check_circle: CheckCircle2,
  notifications: Bell,
  notifications_none: Bell,
  notifications_off: BellOff,
  error: AlertCircle,
  movie: Film,
  electrical_services: Zap,
  wifi: Wifi,
  credit_card: CreditCard,
  close: X,
  security: Shield,
  account_balance: Landmark,
  home: Home,
  subscriptions: ListVideo,
  receipt: Receipt,
  assessment: BarChart3,
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || AlertCircle;
};

// Tailwind bg color class mapping
const getAvatarBgClass = (color: string) => {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
    grey: 'bg-gray-500',
    gray: 'bg-gray-500',
  };
  return colorMap[color] || 'bg-gray-500';
};

// Notification settings
const notificationSettings = ref({
  billReminders: true,
  lowBalanceAlerts: true,
  budgetWarnings: true,
  subscriptionReminders: true,
  goalMilestones: true,
  unusualSpending: true,
  weeklySummary: false,
  pushNotifications: false,
});

// Static data for future backend integration
const activeNotifications = ref([
  {
    id: 1,
    title: 'Budget Alert',
    message: "You've spent 90% of your Entertainment budget this month",
    icon: 'warning',
    color: 'orange',
    amount: 2700,
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    title: 'Bill Reminder',
    message: 'Netflix subscription payment due tomorrow',
    icon: 'payment',
    color: 'red',
    amount: 549,
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 3,
    title: 'Low Balance Alert',
    message: 'GCash balance is running low',
    icon: 'account_balance_wallet',
    color: 'red',
    amount: 1250,
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
  },
  {
    id: 4,
    title: 'Goal Milestone',
    message: "Congratulations! You've reached 50% of your car savings goal",
    icon: 'flag',
    color: 'green',
    amount: 100000,
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
]);

const upcomingBills = ref([
  {
    id: 1,
    name: 'Netflix Subscription',
    category: 'Entertainment',
    amount: 549,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    frequency: 'Monthly',
    icon: 'movie',
    color: 'red',
    reminderDays: 3,
  },
  {
    id: 2,
    name: 'Electricity Bill',
    category: 'Utilities',
    amount: 3500,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    frequency: 'Monthly',
    icon: 'electrical_services',
    color: 'orange',
    reminderDays: 7,
  },
  {
    id: 3,
    name: 'Internet Bill',
    category: 'Utilities',
    amount: 1899,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    frequency: 'Monthly',
    icon: 'wifi',
    color: 'blue',
    reminderDays: 5,
  },
  {
    id: 4,
    name: 'Credit Card Payment',
    category: 'Credit Card',
    amount: 5000,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    frequency: 'Monthly',
    icon: 'credit_card',
    color: 'purple',
    reminderDays: 7,
  },
]);

const notificationHistory = ref([
  {
    id: 1,
    title: 'Budget Exceeded',
    message: 'Food & Dining budget exceeded by \u20B12,500',
    icon: 'warning',
    color: 'red',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: 'Goal Achievement',
    message: 'Emergency fund goal 75% complete',
    icon: 'flag',
    color: 'green',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: 'Unusual Spending',
    message: 'Large transaction detected: \u20B125,000',
    icon: 'error',
    color: 'orange',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    title: 'Weekly Summary',
    message: 'Your weekly financial summary is ready',
    icon: 'assessment',
    color: 'blue',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
]);

const showAddBillSheet = ref(false);
const showDeleteBillConfirm = ref(false);
const billToDelete = ref<any>(null);

const newBill = ref({
  name: '',
  category: 'Utilities',
  amount: null as number | null,
  dueDate: new Date().toISOString().split('T')[0],
  frequency: 'Monthly',
  reminderDays: 3,
});

const billCategories = [
  'Utilities',
  'Entertainment',
  'Insurance',
  'Credit Card',
  'Loan',
  'Rent/Mortgage',
  'Phone/Internet',
  'Subscription',
  'Other',
];

const frequencyOptions = ['Weekly', 'Monthly', 'Quarterly', 'Semi-annually', 'Annually'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatDueDate = (date: Date) => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays < 7) return `in ${diffDays} days`;
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(date);
};

const getDueDateClass = (date: Date) => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return 'text-red-500';
  if (diffDays <= 3) return 'text-orange-500';
  return 'text-green-500';
};

const markAsRead = (notification: any) => {
  notification.read = true;
};

const markAllAsRead = () => {
  activeNotifications.value.forEach((notification) => {
    notification.read = true;
  });

  toast.success('All notifications marked as read');
};

const dismissNotification = (notification: any) => {
  const index = activeNotifications.value.findIndex((n) => n.id === notification.id);
  if (index > -1) {
    activeNotifications.value.splice(index, 1);
  }
};

const addBill = () => {
  if (!newBill.value.name || !newBill.value.amount || !newBill.value.dueDate) {
    return;
  }

  const bill = {
    id: Date.now(),
    name: newBill.value.name,
    category: newBill.value.category,
    amount: parseFloat(String(newBill.value.amount)),
    dueDate: new Date(newBill.value.dueDate),
    frequency: newBill.value.frequency,
    reminderDays: newBill.value.reminderDays,
    icon: getBillIcon(newBill.value.category),
    color: getBillColor(newBill.value.category),
  };

  upcomingBills.value.push(bill);

  // Reset form
  newBill.value = {
    name: '',
    category: 'Utilities',
    amount: null,
    dueDate: new Date().toISOString().split('T')[0],
    frequency: 'Monthly',
    reminderDays: 3,
  };

  showAddBillSheet.value = false;

  toast.success('Bill reminder added successfully');
};

const getBillIcon = (category: string) => {
  const icons: Record<string, string> = {
    Utilities: 'electrical_services',
    Entertainment: 'movie',
    Insurance: 'security',
    'Credit Card': 'credit_card',
    Loan: 'account_balance',
    'Rent/Mortgage': 'home',
    'Phone/Internet': 'wifi',
    Subscription: 'subscriptions',
    Other: 'receipt',
  };
  return icons[category] || 'receipt';
};

const getBillColor = (category: string) => {
  const colors: Record<string, string> = {
    Utilities: 'orange',
    Entertainment: 'red',
    Insurance: 'green',
    'Credit Card': 'purple',
    Loan: 'blue',
    'Rent/Mortgage': 'indigo',
    'Phone/Internet': 'blue',
    Subscription: 'teal',
    Other: 'grey',
  };
  return colors[category] || 'grey';
};

const markBillAsPaid = (bill: any) => {
  // Remove from upcoming bills and add to history
  const index = upcomingBills.value.findIndex((b) => b.id === bill.id);
  if (index > -1) {
    upcomingBills.value.splice(index, 1);

    // Add to notification history
    notificationHistory.value.unshift({
      id: Date.now(),
      title: 'Bill Paid',
      message: `${bill.name} payment of ${formatCurrency(bill.amount)} completed`,
      icon: 'check_circle',
      color: 'green',
      createdAt: new Date(),
    });
  }

  toast.success(`${bill.name} marked as paid`);
};

const editBill = (bill: any) => {
  // This would open an edit dialog
  console.log('Edit bill:', bill);
};

const confirmDeleteBill = (bill: any) => {
  billToDelete.value = bill;
  showDeleteBillConfirm.value = true;
};

const deleteBill = () => {
  if (!billToDelete.value) return;
  const index = upcomingBills.value.findIndex((b) => b.id === billToDelete.value.id);
  if (index > -1) {
    upcomingBills.value.splice(index, 1);
    toast.success('Bill deleted successfully');
  }
  showDeleteBillConfirm.value = false;
  billToDelete.value = null;
};

const togglePushNotifications = async (enabled: boolean) => {
  notificationSettings.value.pushNotifications = enabled;
  if (enabled) {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Push notifications enabled');
      } else {
        notificationSettings.value.pushNotifications = false;
        toast.error('Push notifications permission denied');
      }
    } else {
      notificationSettings.value.pushNotifications = false;
      toast.error('Push notifications not supported');
    }
  } else {
    toast.info('Push notifications disabled');
  }
};

// Simulate real-time notifications
const simulateNotification = () => {
  const notifications = [
    {
      title: 'Budget Alert',
      message: "You've spent 80% of your monthly budget",
      icon: 'warning',
      color: 'orange',
    },
    {
      title: 'Goal Progress',
      message: "You're 10% closer to your savings goal",
      icon: 'flag',
      color: 'green',
    },
    {
      title: 'Bill Reminder',
      message: 'Water bill due in 2 days',
      icon: 'payment',
      color: 'blue',
    },
  ];

  const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];

  activeNotifications.value.unshift({
    id: Date.now(),
    title: randomNotification.title,
    message: randomNotification.message,
    icon: randomNotification.icon,
    color: randomNotification.color,
    read: false,
    createdAt: new Date(),
  });
};

onMounted(() => {
  // Simulate notifications every 30 seconds for demo
  setInterval(simulateNotification, 30000);
});
</script>
