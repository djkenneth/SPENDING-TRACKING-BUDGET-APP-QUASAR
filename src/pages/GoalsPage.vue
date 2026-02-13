<!-- src/pages/GoalsPage.vue -->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGoalStore } from 'src/stores/goals';
import { storeToRefs } from 'pinia';
import { FinancialGoal, CreateGoalData, GoalFilters } from 'src/types/goal.types';
import { format } from 'date-fns';
import { formatCurrency } from 'src/utilities/currency';
import { formatDate } from 'src/utilities/date';
import { toast } from 'vue-sonner';

// shadcn-vue components
import { Card, CardContent } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Badge } from 'src/components/ui/badge';
import { ScrollArea } from 'src/components/ui/scroll-area';
import { Textarea } from 'src/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';

// Lucide icons
import {
  Flag,
  Plus,
  MoreVertical,
  Pencil,
  PlusCircle,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Calendar,
  DollarSign,
} from 'lucide-vue-next';

const goalStore = useGoalStore();

// Reactive store refs
const {
  goals,
  meta,
  loading,
  error,
  totalTargetAmount,
  totalCurrentAmount,
  overallProgress,
} = storeToRefs(goalStore);

// Local state
const showCreateDialog = ref(false);
const showContributionDialog = ref(false);
const showDeleteConfirm = ref(false);
const showCompleteConfirm = ref(false);
const editingGoal = ref<FinancialGoal | null>(null);
const selectedGoalForContribution = ref<FinancialGoal | null>(null);
const goalToDelete = ref<number | null>(null);
const goalToComplete = ref<number | null>(null);

const filters = ref<GoalFilters>({
  sort_by: 'target_amount',
  sort_order: 'desc',
});

const goalForm = ref<Partial<CreateGoalData>>({
  name: '',
  description: '',
  target_amount: undefined,
  target_date: '',
  priority: 'medium',
  color: '#2196F3',
  icon: 'flag',
});

const contributionForm = ref({
  amount: undefined as number | undefined,
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
});

// Options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
];

const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const sortOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Target Amount', value: 'target_amount' },
  { label: 'Progress', value: 'progress_percentage' },
  { label: 'Target Date', value: 'target_date' },
  { label: 'Priority', value: 'priority' },
];

// Methods
const fetchGoalsWithFilters = async () => {
  await goalStore.fetchGoals(filters.value);
};

const openEditDialog = (goal: FinancialGoal) => {
  editingGoal.value = goal;
  goalForm.value = {
    name: goal.name,
    description: goal.description || '',
    target_amount: parseFloat(goal.target_amount),
    target_date: goal.target_date,
    priority: goal.priority,
    color: goal.color,
    icon: goal.icon,
  };
  showCreateDialog.value = true;
};

const openContributionDialog = (goal: FinancialGoal) => {
  selectedGoalForContribution.value = goal;
  contributionForm.value = {
    amount: undefined,
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  };
  showContributionDialog.value = true;
};

const closeDialog = () => {
  showCreateDialog.value = false;
  editingGoal.value = null;
  goalForm.value = {
    name: '',
    description: '',
    target_amount: undefined,
    target_date: '',
    priority: 'medium',
    color: '#2196F3',
    icon: 'flag',
  };
};

const closeContributionDialog = () => {
  showContributionDialog.value = false;
  selectedGoalForContribution.value = null;
  contributionForm.value = {
    amount: undefined,
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  };
};

const handleSaveGoal = async () => {
  try {
    if (editingGoal.value) {
      await goalStore.updateGoal(editingGoal.value.id, goalForm.value);
      toast.success('Goal updated successfully');
    } else {
      await goalStore.createGoal(goalForm.value as CreateGoalData);
      toast.success('Goal created successfully');
    }
    closeDialog();
  } catch (err: any) {
    toast.error(error.value || 'Failed to save goal');
  }
};

const handleSaveContribution = async () => {
  if (!selectedGoalForContribution.value || !contributionForm.value.amount) {
    return;
  }

  try {
    await goalStore.addContribution(selectedGoalForContribution.value.id, {
      amount: contributionForm.value.amount,
      date: contributionForm.value.date,
      notes: contributionForm.value.notes || undefined,
    });
    toast.success('Contribution added successfully');
    closeContributionDialog();
  } catch (err: any) {
    toast.error(error.value || 'Failed to add contribution');
  }
};

const handleCompleteGoal = async () => {
  if (!goalToComplete.value) return;
  try {
    await goalStore.completeGoal(goalToComplete.value);
    toast.success('Goal marked as completed');
  } catch (err: any) {
    toast.error(error.value || 'Failed to complete goal');
  } finally {
    showCompleteConfirm.value = false;
    goalToComplete.value = null;
  }
};

const handlePauseGoal = async (goalId: number) => {
  try {
    await goalStore.pauseGoal(goalId);
    toast.success('Goal paused');
  } catch (err: any) {
    toast.error(error.value || 'Failed to pause goal');
  }
};

const handleResumeGoal = async (goalId: number) => {
  try {
    await goalStore.resumeGoal(goalId);
    toast.success('Goal resumed');
  } catch (err: any) {
    toast.error(error.value || 'Failed to resume goal');
  }
};

const handleDeleteGoal = async () => {
  if (!goalToDelete.value) return;
  try {
    await goalStore.deleteGoal(goalToDelete.value);
    toast.success('Goal deleted successfully');
  } catch (err: any) {
    toast.error(error.value || 'Failed to delete goal');
  } finally {
    showDeleteConfirm.value = false;
    goalToDelete.value = null;
  }
};

// Utility functions
const getProgressColor = (progress: number) => {
  if (progress >= 75) return 'bg-emerald-500';
  if (progress >= 50) return 'bg-amber-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive' as const;
    case 'medium':
      return 'default' as const;
    case 'low':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default' as const;
    case 'completed':
      return 'secondary' as const;
    case 'paused':
      return 'outline' as const;
    case 'cancelled':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
};

// Lifecycle
onMounted(async () => {
  await fetchGoalsWithFilters();
});
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Financial Goals</h1>
        <p class="text-sm text-muted-foreground">Track and achieve your financial objectives</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="w-4 h-4 mr-1" />
        New Goal
      </Button>
    </div>

    <!-- Summary Stats -->
    <div v-if="meta" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card class="hover:-translate-y-0.5 hover:shadow-md transition-all">
        <CardContent class="pt-5 pb-4 px-4">
          <div class="text-xs text-muted-foreground">Total Goals</div>
          <div class="text-xl font-bold mt-1">{{ meta.total }}</div>
          <div class="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            {{ meta.active_goals }} active
          </div>
        </CardContent>
      </Card>

      <Card class="hover:-translate-y-0.5 hover:shadow-md transition-all">
        <CardContent class="pt-5 pb-4 px-4">
          <div class="text-xs text-muted-foreground">Total Target</div>
          <div class="text-xl font-bold mt-1">
            {{ formatCurrency(totalTargetAmount) }}
          </div>
        </CardContent>
      </Card>

      <Card class="hover:-translate-y-0.5 hover:shadow-md transition-all">
        <CardContent class="pt-5 pb-4 px-4">
          <div class="text-xs text-muted-foreground">Total Saved</div>
          <div class="text-xl font-bold mt-1">
            {{ formatCurrency(totalCurrentAmount) }}
          </div>
        </CardContent>
      </Card>

      <Card class="hover:-translate-y-0.5 hover:shadow-md transition-all">
        <CardContent class="pt-5 pb-4 px-4">
          <div class="text-xs text-muted-foreground">Overall Progress</div>
          <div class="text-xl font-bold mt-1">{{ overallProgress.toFixed(1) }}%</div>
          <div class="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-primary transition-all duration-500"
              :style="{ width: overallProgress + '%' }"
            />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <Select
        :model-value="filters.status || ''"
        @update:model-value="(v: any) => { filters.status = v || undefined; fetchGoalsWithFilters(); }"
      >
        <SelectTrigger class="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        :model-value="filters.priority || ''"
        @update:model-value="(v: any) => { filters.priority = v || undefined; fetchGoalsWithFilters(); }"
      >
        <SelectTrigger class="w-[140px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        :model-value="filters.sort_by || 'target_amount'"
        @update:model-value="(v: any) => { filters.sort_by = v; fetchGoalsWithFilters(); }"
      >
        <SelectTrigger class="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        @click="filters.sort_order = filters.sort_order === 'asc' ? 'desc' : 'asc'; fetchGoalsWithFilters()"
      >
        <ArrowUp v-if="filters.sort_order === 'asc'" class="w-4 h-4" />
        <ArrowDown v-else class="w-4 h-4" />
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 3" :key="n" class="animate-pulse bg-muted rounded-xl h-[220px]" />
    </div>

    <!-- Goals Grid -->
    <div v-else-if="goals.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="goal in goals"
        :key="goal.id"
        class="hover:-translate-y-0.5 hover:shadow-md transition-all"
        :class="{ 'opacity-70': goal.status === 'completed' || goal.status === 'cancelled' }"
      >
        <CardContent class="pt-5 pb-4 px-4">
          <!-- Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-1">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  :style="{ backgroundColor: goal.color + '22' }"
                >
                  <Flag class="w-3.5 h-3.5" :style="{ color: goal.color }" />
                </div>
                <span class="font-semibold text-sm truncate">{{ goal.name }}</span>
              </div>
              <p v-if="goal.description" class="text-xs text-muted-foreground truncate">
                {{ goal.description.substring(0, 35) }}{{ goal.description.length > 35 ? '...' : '' }}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 flex-shrink-0">
                  <MoreVertical class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="openEditDialog(goal)">
                  <Pencil class="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem @click="openContributionDialog(goal)">
                  <PlusCircle class="w-4 h-4 mr-2" /> Add Contribution
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-if="goal.status === 'active'"
                  @click="goalToComplete = goal.id; showCompleteConfirm = true"
                >
                  <CheckCircle2 class="w-4 h-4 mr-2 text-emerald-500" /> Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="goal.status === 'active'"
                  @click="handlePauseGoal(goal.id)"
                >
                  <PauseCircle class="w-4 h-4 mr-2" /> Pause
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="goal.status === 'paused'"
                  @click="handleResumeGoal(goal.id)"
                >
                  <PlayCircle class="w-4 h-4 mr-2 text-primary" /> Resume
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive"
                  @click="goalToDelete = goal.id; showDeleteConfirm = true"
                >
                  <Trash2 class="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Progress -->
          <div class="mb-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-muted-foreground">Progress</span>
              <span class="text-xs font-bold">{{ goal.progress_percentage.toFixed(1) }}%</span>
            </div>
            <div class="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getProgressColor(goal.progress_percentage)"
                :style="{ width: goal.progress_percentage + '%' }"
              />
            </div>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs text-muted-foreground">
                {{ formatCurrency(parseFloat(goal.current_amount)) }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ formatCurrency(parseFloat(goal.target_amount)) }}
              </span>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div>
              <div class="text-muted-foreground">Target Date</div>
              <div class="font-medium">{{ formatDate(goal.target_date, 'MMM dd, yyyy') }}</div>
            </div>
            <div>
              <div class="text-muted-foreground">Days Left</div>
              <div class="font-medium">{{ Math.ceil(goal.days_remaining) }} days</div>
            </div>
            <div>
              <div class="text-muted-foreground">Monthly Target</div>
              <div class="font-medium">{{ formatCurrency(goal.monthly_target) }}</div>
            </div>
            <div>
              <div class="text-muted-foreground">Status</div>
              <Badge :variant="getStatusVariant(goal.status)" class="text-[10px] px-1.5 py-0">
                {{ goal.status.toUpperCase() }}
              </Badge>
            </div>
          </div>

          <!-- Badges -->
          <div class="flex flex-wrap gap-1.5 mt-3">
            <Badge :variant="getPriorityVariant(goal.priority)" class="text-[10px]">
              {{ goal.priority.toUpperCase() }}
            </Badge>
            <Badge v-if="goal.is_on_track" variant="secondary" class="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              ON TRACK
            </Badge>
            <Badge v-if="goal.is_overdue" variant="destructive" class="text-[10px]">
              OVERDUE
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Flag class="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-semibold text-muted-foreground mb-1">No goals yet</h3>
      <p class="text-sm text-muted-foreground mb-4">Create your first financial goal to get started</p>
      <Button @click="showCreateDialog = true">
        <Plus class="w-4 h-4 mr-1" /> Create Goal
      </Button>
    </div>

    <!-- FAB (mobile) -->
    <Button
      v-if="goals.length > 0"
      class="fixed bottom-20 right-4 lg:bottom-6 rounded-full w-14 h-14 shadow-lg"
      size="icon"
      @click="showCreateDialog = true"
    >
      <Plus class="w-6 h-6" />
    </Button>

    <!-- Create/Edit Goal Sheet -->
    <Sheet :open="showCreateDialog" @update:open="(v: boolean) => { if (!v) closeDialog(); }">
      <SheetContent side="bottom" class="h-[85vh] rounded-t-2xl">
        <SheetHeader class="px-4 pt-4 pb-2">
          <SheetTitle>{{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}</SheetTitle>
        </SheetHeader>
        <ScrollArea class="h-full px-4 pb-20">
          <div class="space-y-4 py-2">
            <div class="space-y-2">
              <Label>Goal Name *</Label>
              <Input v-model="goalForm.name" placeholder="e.g. Emergency Fund" />
            </div>

            <div class="space-y-2">
              <Label>Description</Label>
              <Textarea v-model="goalForm.description" placeholder="Describe your goal..." :rows="3" />
            </div>

            <div class="space-y-2">
              <Label>Target Amount *</Label>
              <div class="relative">
                <DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  v-model.number="goalForm.target_amount"
                  type="number"
                  placeholder="0.00"
                  class="pl-9"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label>Target Date *</Label>
              <div class="relative">
                <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input v-model="goalForm.target_date" type="date" class="pl-9" />
              </div>
            </div>

            <div class="space-y-2">
              <Label>Priority *</Label>
              <Select v-model="goalForm.priority">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>Color</Label>
              <div class="flex items-center gap-3">
                <input
                  type="color"
                  v-model="goalForm.color"
                  class="w-10 h-10 rounded-lg border border-input cursor-pointer"
                />
                <span class="text-sm text-muted-foreground">{{ goalForm.color }}</span>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <Button variant="outline" class="flex-1" @click="closeDialog">Cancel</Button>
              <Button class="flex-1" @click="handleSaveGoal" :disabled="loading">
                <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                {{ editingGoal ? 'Update' : 'Create' }}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>

    <!-- Contribution Sheet -->
    <Sheet :open="showContributionDialog" @update:open="(v: boolean) => { if (!v) closeContributionDialog(); }">
      <SheetContent side="bottom" class="h-auto max-h-[70vh] rounded-t-2xl">
        <SheetHeader class="px-4 pt-4 pb-2">
          <SheetTitle>Add Contribution</SheetTitle>
          <p v-if="selectedGoalForContribution" class="text-sm text-muted-foreground">
            {{ selectedGoalForContribution.name }}
          </p>
        </SheetHeader>
        <div class="px-4 pb-6 space-y-4">
          <div class="space-y-2">
            <Label>Amount *</Label>
            <div class="relative">
              <DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                v-model.number="contributionForm.amount"
                type="number"
                placeholder="0.00"
                class="pl-9"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Date</Label>
            <Input v-model="contributionForm.date" type="date" />
          </div>

          <div class="space-y-2">
            <Label>Notes</Label>
            <Textarea v-model="contributionForm.notes" placeholder="Optional notes..." :rows="2" />
          </div>

          <div class="flex gap-3 pt-2">
            <Button variant="outline" class="flex-1" @click="closeContributionDialog">Cancel</Button>
            <Button class="flex-1" @click="handleSaveContribution" :disabled="loading">
              <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              Add Contribution
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteConfirm" @update:open="(v: boolean) => { showDeleteConfirm = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Goal</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this goal? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2">
          <Button variant="outline" @click="showDeleteConfirm = false">Cancel</Button>
          <Button variant="destructive" @click="handleDeleteGoal">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Complete Confirmation Dialog -->
    <Dialog :open="showCompleteConfirm" @update:open="(v: boolean) => { showCompleteConfirm = v; }">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Goal</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this goal as completed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex gap-2">
          <Button variant="outline" @click="showCompleteConfirm = false">Cancel</Button>
          <Button @click="handleCompleteGoal">
            <CheckCircle2 class="w-4 h-4 mr-1" /> Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
