<template>
  <div class="notification-system">
    <!-- Notification Settings -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Notification Settings</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-list>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Bill Reminders</q-item-label>
                  <q-item-label caption>Get notified about upcoming bills</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="notificationSettings.billReminders" />
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Low Balance Alerts</q-item-label>
                  <q-item-label caption>Alert when account balance is low</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="notificationSettings.lowBalanceAlerts" />
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Budget Warnings</q-item-label>
                  <q-item-label caption>Warn when approaching budget limits</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="notificationSettings.budgetWarnings" />
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Subscription Reminders</q-item-label>
                  <q-item-label caption>Remind about subscription renewals</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="notificationSettings.subscriptionReminders" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="col-12 col-md-6">
            <q-list>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Goal Milestones</q-item-label>
                  <q-item-label caption>Celebrate when reaching savings goals</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="notificationSettings.goalMilestones" />
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Unusual Spending</q-item-label>
                  <q-item-label caption>Alert for unusual spending patterns</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="notificationSettings.unusualSpending" />
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Weekly Summary</q-item-label>
                  <q-item-label caption>Weekly financial summary report</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="notificationSettings.weeklySummary" />
                </q-item-section>
              </q-item>

              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Push Notifications</q-item-label>
                  <q-item-label caption>Enable browser push notifications</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="notificationSettings.pushNotifications"
                    @update:model-value="togglePushNotifications"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Active Notifications -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Active Notifications</div>
          <q-btn flat size="sm" color="primary" label="Mark All Read" @click="markAllAsRead" />
        </div>

        <div v-if="activeNotifications.length === 0" class="text-center text-grey-6 q-pa-lg">
          <q-icon name="notifications_none" size="64px" class="q-mb-md" />
          <div class="text-h6">No Active Notifications</div>
          <div class="text-caption">
            All caught up! You'll be notified of important updates here.
          </div>
        </div>

        <div
          v-for="notification in activeNotifications"
          :key="notification.id"
          class="notification-item q-mb-sm"
        >
          <q-item
            :class="['notification-card', { unread: !notification.read }]"
            clickable
            @click="markAsRead(notification)"
          >
            <q-item-section avatar>
              <q-avatar :color="notification.color" text-color="white" size="40px">
                <q-icon :name="notification.icon" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle2">{{ notification.title }}</q-item-label>
              <q-item-label caption>{{ notification.message }}</q-item-label>
              <q-item-label caption class="text-grey-5">{{
                formatTimeAgo(notification.createdAt)
              }}</q-item-label>
            </q-item-section>

            <q-item-section side v-if="notification.amount">
              <q-item-label class="text-subtitle2">{{
                formatCurrency(notification.amount)
              }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn
                flat
                size="sm"
                round
                icon="close"
                @click.stop="dismissNotification(notification)"
              />
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>

    <!-- Upcoming Bills -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Upcoming Bills</div>
          <q-btn
            flat
            size="sm"
            color="primary"
            label="Add Bill"
            @click="showAddBillDialog = true"
          />
        </div>

        <div v-for="bill in upcomingBills" :key="bill.id" class="bill-item q-mb-md">
          <q-card flat bordered class="q-pa-md">
            <div class="row items-center">
              <q-avatar size="40px" :color="bill.color" text-color="white" class="q-mr-md">
                <q-icon :name="bill.icon" />
              </q-avatar>

              <div class="col">
                <div class="text-subtitle1 text-weight-medium">{{ bill.name }}</div>
                <div class="text-caption text-grey-6">
                  {{ bill.category }} • {{ bill.frequency }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-h6 text-weight-bold">{{ formatCurrency(bill.amount) }}</div>
                <div class="text-caption" :class="getDueDateClass(bill.dueDate)">
                  Due {{ formatDueDate(bill.dueDate) }}
                </div>
              </div>
            </div>

            <div class="row q-mt-md q-gutter-sm">
              <q-btn
                flat
                size="sm"
                color="primary"
                label="Mark Paid"
                icon="check"
                @click="markBillAsPaid(bill)"
              />
              <q-btn flat size="sm" color="grey" label="Edit" icon="edit" @click="editBill(bill)" />
              <q-btn
                flat
                size="sm"
                color="red"
                label="Delete"
                icon="delete"
                @click="deleteBill(bill)"
              />
            </div>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <!-- Notification History -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Notification History</div>

        <q-timeline>
          <q-timeline-entry
            v-for="notification in notificationHistory"
            :key="notification.id"
            :color="notification.color"
            :icon="notification.icon"
          >
            <template #title>
              <div class="text-subtitle2">{{ notification.title }}</div>
            </template>

            <template #subtitle>
              <div class="text-caption text-grey-6">
                {{ formatDateTime(notification.createdAt) }}
              </div>
            </template>

            <div class="text-caption">{{ notification.message }}</div>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>

    <!-- Add Bill Dialog -->
    <q-dialog v-model="showAddBillDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add Bill Reminder</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-input v-model="newBill.name" label="Bill Name" required />

            <q-select
              v-model="newBill.category"
              :options="billCategories"
              label="Category"
              required
            />

            <q-input
              v-model.number="newBill.amount"
              label="Amount"
              type="number"
              step="0.01"
              required
              prefix="₱"
            />

            <q-input v-model="newBill.dueDate" label="Due Date" type="date" required />

            <q-select
              v-model="newBill.frequency"
              :options="frequencyOptions"
              label="Frequency"
              required
            />

            <q-input
              v-model.number="newBill.reminderDays"
              label="Remind me (days before)"
              type="number"
              min="1"
              max="30"
              required
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showAddBillDialog = false" />
          <q-btn label="Add Bill" color="primary" @click="addBill" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

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
    message: 'Food & Dining budget exceeded by ₱2,500',
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
    message: 'Large transaction detected: ₱25,000',
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

const showAddBillDialog = ref(false);
const newBill = ref({
  name: '',
  category: 'Utilities',
  amount: null,
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diffTime = now - date;
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatDueDate = (date) => {
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays < 7) return `in ${diffDays} days`;
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(date);
};

const getDueDateClass = (date) => {
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return 'text-red';
  if (diffDays <= 3) return 'text-orange';
  return 'text-green';
};

const markAsRead = (notification) => {
  notification.read = true;
};

const markAllAsRead = () => {
  activeNotifications.value.forEach((notification) => {
    notification.read = true;
  });

  $q.notify({
    color: 'positive',
    message: 'All notifications marked as read',
    icon: 'check',
  });
};

const dismissNotification = (notification) => {
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
    amount: parseFloat(newBill.value.amount),
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

  showAddBillDialog.value = false;

  $q.notify({
    color: 'positive',
    message: 'Bill reminder added successfully',
    icon: 'check',
  });
};

const getBillIcon = (category) => {
  const icons = {
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

const getBillColor = (category) => {
  const colors = {
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

const markBillAsPaid = (bill) => {
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

  $q.notify({
    color: 'positive',
    message: `${bill.name} marked as paid`,
    icon: 'check',
  });
};

const editBill = (bill) => {
  // This would open an edit dialog
  console.log('Edit bill:', bill);
};

const deleteBill = (bill) => {
  $q.dialog({
    title: 'Delete Bill',
    message: `Are you sure you want to delete ${bill.name}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const index = upcomingBills.value.findIndex((b) => b.id === bill.id);
    if (index > -1) {
      upcomingBills.value.splice(index, 1);
      $q.notify({
        color: 'positive',
        message: 'Bill deleted successfully',
        icon: 'check',
      });
    }
  });
};

const togglePushNotifications = async (enabled) => {
  if (enabled) {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        $q.notify({
          color: 'positive',
          message: 'Push notifications enabled',
          icon: 'notifications',
        });
      } else {
        notificationSettings.value.pushNotifications = false;
        $q.notify({
          color: 'negative',
          message: 'Push notifications permission denied',
          icon: 'error',
        });
      }
    } else {
      notificationSettings.value.pushNotifications = false;
      $q.notify({
        color: 'negative',
        message: 'Push notifications not supported',
        icon: 'error',
      });
    }
  } else {
    $q.notify({
      color: 'info',
      message: 'Push notifications disabled',
      icon: 'notifications_off',
    });
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

<style scoped>
.notification-system {
  max-width: 1000px;
  margin: 0 auto;
}

.notification-item {
  transition: all 0.3s ease;
}

.notification-card {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.notification-card:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.notification-card.unread {
  background-color: rgba(33, 150, 243, 0.05);
  border-left: 4px solid #2196f3;
}

.bill-item {
  transition: transform 0.2s ease;
}

.bill-item:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .notification-system {
    padding: 0 8px;
  }
}
</style>
