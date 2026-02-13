<!-- src/pages/CategoriesPage.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoriesStore } from 'src/stores/categories';
import { CategoryWithSpending } from 'src/types/category.types';

// shadcn-vue components
import { Card, CardContent } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Separator } from 'src/components/ui/separator';
import { Checkbox } from 'src/components/ui/checkbox';
import { ScrollArea } from 'src/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from 'src/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from 'src/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'src/components/ui/collapsible';

// Lucide icons
import {
  Tag,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pencil,
  Trash2,
  Receipt,
  Plus,
  Loader2,
  FolderOpen,
  Expand,
  Shrink,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-vue-next';

const router = useRouter();
const categoriesStore = useCategoriesStore();

// State
const searchQuery = ref('');
const selectedCategories = ref<number[]>([]);
const showCategoryDialog = ref(false);
const showDeleteDialog = ref(false);
const isEditing = ref(false);
const categoryToDelete = ref<CategoryWithSpending | null>(null);
const editingCategoryId = ref<number | null>(null);

// Category form
const categoryForm = reactive({
  name: '',
  type: 'expense' as 'income' | 'expense' | 'both',
  icon: 'category',
  color: '#3B82F6',
  parent_id: null as number | null,
  budget_amount: 0,
});

// Computed
const filteredCategories = computed(() => {
  if (!searchQuery.value) {
    return categoriesStore.hierarchicalCategories;
  }

  const query = searchQuery.value.toLowerCase();

  // Filter and search through hierarchical categories
  return categoriesStore.hierarchicalCategories.filter((category) => {
    const matchesParent = category.name.toLowerCase().includes(query);
    const matchesChildren = category.children?.some((child) =>
      child.name.toLowerCase().includes(query)
    );
    return matchesParent || matchesChildren;
  });
});

const parentCategoryOptions = computed(() => {
  return categoriesStore.hierarchicalCategories
    .filter((c) => !c.parent_id && c.id !== editingCategoryId.value)
    .map((c) => ({
      label: c.name,
      value: c.id,
    }));
});

// Methods
const getPercentageClass = (percentage: number): string => {
  if (percentage >= 100) return 'text-red-600 font-bold';
  if (percentage >= 90) return 'text-yellow-600 font-bold';
  if (percentage >= 75) return 'text-orange-500';
  return 'text-muted-foreground';
};

const getProgressColorClass = (percentage: number): string => {
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 90) return 'bg-orange-500';
  if (percentage >= 75) return 'bg-amber-500';
  return 'bg-green-500';
};

const toggleCategorySelection = (categoryId: number, checked: boolean) => {
  if (checked) {
    if (!selectedCategories.value.includes(categoryId)) {
      selectedCategories.value.push(categoryId);
    }
  } else {
    selectedCategories.value = selectedCategories.value.filter(id => id !== categoryId);
  }
};

const openAddCategoryDialog = () => {
  isEditing.value = false;
  editingCategoryId.value = null;
  // Reset form
  categoryForm.name = '';
  categoryForm.type = 'expense';
  categoryForm.icon = 'category';
  categoryForm.color = '#3B82F6';
  categoryForm.parent_id = null;
  categoryForm.budget_amount = 0;
  showCategoryDialog.value = true;
};

const editCategory = (category: CategoryWithSpending) => {
  isEditing.value = true;
  editingCategoryId.value = category.id;
  categoryForm.name = category.name;
  categoryForm.type = category.type;
  categoryForm.icon = category.icon;
  categoryForm.color = category.color;
  categoryForm.parent_id = category.parent_id;
  categoryForm.budget_amount = category.budget_amount || 0;
  showCategoryDialog.value = true;
};

const saveCategory = async () => {
  if (!categoryForm.name.trim()) return;

  try {
    if (isEditing.value && editingCategoryId.value) {
      await categoriesStore.updateCategory(editingCategoryId.value, {
        name: categoryForm.name,
        type: categoryForm.type,
        icon: categoryForm.icon,
        color: categoryForm.color,
        parent_id: categoryForm.parent_id ?? undefined,
        budget_amount: categoryForm.budget_amount || undefined,
      });
    } else {
      await categoriesStore.createCategory({
        name: categoryForm.name,
        type: categoryForm.type,
        icon: categoryForm.icon,
        color: categoryForm.color,
        parent_id: categoryForm.parent_id ?? undefined,
        budget_amount: categoryForm.budget_amount || undefined,
      });
    }
    showCategoryDialog.value = false;
  } catch (err) {
    console.error('Failed to save category:', err);
  }
};

const confirmDeleteCategory = (category: CategoryWithSpending) => {
  categoryToDelete.value = category;
  showDeleteDialog.value = true;
};

const deleteCategory = async () => {
  if (!categoryToDelete.value) return;

  try {
    await categoriesStore.deleteCategory(categoryToDelete.value.id);
    showDeleteDialog.value = false;
    categoryToDelete.value = null;
  } catch (err) {
    console.error('Failed to delete category:', err);
  }
};

const viewTransactions = (category: CategoryWithSpending) => {
  router.push({
    name: 'transactions',
    query: { category_id: category.id },
  });
};

// Initialize data
onMounted(async () => {
  await categoriesStore.initializeCategoriesData();
});
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <div class="p-4 space-y-4">
      <!-- Page Header -->
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-2xl font-bold">Categories</h2>
          <p class="text-sm text-muted-foreground">
            Organize your transactions with custom categories and budgets
          </p>
        </div>
        <Button class="hidden lg:flex" @click="openAddCategoryDialog">
          <Plus class="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <!-- Summary Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                <Tag class="w-5 h-5 text-primary" />
              </div>
              <div>
                <div class="text-xl font-bold">{{ categoriesStore.totalCategories }}</div>
                <div class="text-xs text-muted-foreground">Total Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10">
                <DollarSign class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div class="text-xl font-bold">
                  {{ categoriesStore.formatCurrency(categoriesStore.totalBudget) }}
                </div>
                <div class="text-xs text-muted-foreground">Total Budget</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-500/10">
                <TrendingUp class="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div class="text-xl font-bold">
                  {{ categoriesStore.formatCurrency(categoriesStore.totalSpent) }}
                </div>
                <div class="text-xs text-muted-foreground">Total Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10">
                <Receipt class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div class="text-xl font-bold">{{ categoriesStore.totalTransactions }}</div>
                <div class="text-xs text-muted-foreground">Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Search and Actions -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div class="relative flex-1 sm:max-w-xs">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            placeholder="Search categories..."
            class="pl-9 pr-9"
          />
          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2"
            @click="searchQuery = ''"
          >
            <X class="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <div class="flex-1" />

        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="categoriesStore.expandAll">
            <Expand class="w-4 h-4 mr-1.5" />
            <span class="hidden sm:inline">Expand All</span>
          </Button>
          <Button variant="outline" size="sm" @click="categoriesStore.collapseAll">
            <Shrink class="w-4 h-4 mr-1.5" />
            <span class="hidden sm:inline">Collapse All</span>
          </Button>
          <Button size="sm" class="hidden sm:flex lg:hidden" @click="openAddCategoryDialog">
            <Plus class="w-4 h-4 mr-1.5" />
            Add
          </Button>
        </div>
      </div>

      <!-- Categories List -->
      <Card>
        <CardContent class="p-0">
          <!-- Loading -->
          <div v-if="categoriesStore.loading" class="flex flex-col items-center justify-center py-16">
            <Loader2 class="w-12 h-12 text-primary animate-spin" />
            <p class="mt-3 text-sm text-muted-foreground">Loading categories...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredCategories.length === 0" class="flex flex-col items-center justify-center py-16 space-y-3">
            <FolderOpen class="w-16 h-16 text-muted-foreground/40" />
            <div class="text-lg font-medium text-muted-foreground">No categories found</div>
            <p class="text-sm text-muted-foreground">
              {{ searchQuery ? 'Try adjusting your search' : 'Create your first category to get started' }}
            </p>
            <Button v-if="!searchQuery" @click="openAddCategoryDialog">
              <Plus class="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </div>

          <!-- Category Items -->
          <div v-else class="divide-y">
            <template v-for="category in filteredCategories" :key="category.id">
              <Collapsible
                :open="categoriesStore.isExpanded(category.id)"
                @update:open="categoriesStore.toggleExpand(category.id)"
              >
                <!-- Parent Category Row -->
                <div class="flex items-center gap-2 px-3 py-3 sm:px-4 hover:bg-muted/50 transition-colors">
                  <!-- Checkbox -->
                  <Checkbox
                    :checked="selectedCategories.includes(category.id)"
                    @update:checked="(val: boolean) => toggleCategorySelection(category.id, val)"
                    class="shrink-0"
                  />

                  <!-- Expand/Collapse Button -->
                  <CollapsibleTrigger v-if="category.has_children" as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                      <ChevronDown
                        class="w-4 h-4 transition-transform"
                        :class="{ '-rotate-180': categoriesStore.isExpanded(category.id) }"
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <div v-else class="w-8 shrink-0" />

                  <!-- Category Avatar -->
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    :style="{ backgroundColor: category.color + '20' }"
                  >
                    <Tag class="w-5 h-5" :style="{ color: category.color }" />
                  </div>

                  <!-- Name & Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-sm truncate">{{ category.name }}</span>
                      <span class="text-xs text-muted-foreground shrink-0">
                        {{ category.transaction_count }} txns
                      </span>
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ categoriesStore.formatCurrency(category.total_spent) }} /
                      {{ categoriesStore.formatCurrency(category.budget_amount) }}
                    </div>
                  </div>

                  <!-- Progress Bar (hidden on small screens) -->
                  <div class="hidden sm:block w-24 lg:w-32 shrink-0">
                    <div class="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="getProgressColorClass(category.percentage)"
                        :style="{ width: Math.min(category.percentage, 100) + '%' }"
                      />
                    </div>
                  </div>

                  <!-- Percentage -->
                  <div class="w-12 text-right shrink-0">
                    <span class="text-xs" :class="getPercentageClass(category.percentage)">
                      {{ category.percentage.toFixed(0) }}%
                    </span>
                  </div>

                  <!-- Actions Menu -->
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0">
                        <MoreVertical class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="editCategory(category)">
                        <Pencil class="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="viewTransactions(category)">
                        <Receipt class="w-4 h-4 mr-2" />
                        View Transactions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem class="text-destructive" @click="confirmDeleteCategory(category)">
                        <Trash2 class="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <!-- Children Categories (Subcategories) -->
                <CollapsibleContent v-if="category.has_children">
                  <div
                    v-for="child in category.children"
                    :key="child.id"
                    class="flex items-center gap-2 px-3 py-2.5 sm:px-4 pl-8 sm:pl-12 bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <!-- Checkbox -->
                    <Checkbox
                      :checked="selectedCategories.includes(child.id)"
                      @update:checked="(val: boolean) => toggleCategorySelection(child.id, val)"
                      class="shrink-0"
                    />

                    <!-- Spacer for alignment -->
                    <div class="w-8 shrink-0" />

                    <!-- Category Avatar -->
                    <div
                      class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      :style="{ backgroundColor: child.color + '20' }"
                    >
                      <Tag class="w-4 h-4" :style="{ color: child.color }" />
                    </div>

                    <!-- Name & Details -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-sm truncate">{{ child.name }}</span>
                        <span class="text-xs text-muted-foreground shrink-0">
                          {{ child.transaction_count }} txns
                        </span>
                      </div>
                      <div class="text-xs text-muted-foreground">
                        {{ categoriesStore.formatCurrency(child.total_spent) }} /
                        {{ categoriesStore.formatCurrency(child.budget_amount) }}
                      </div>
                    </div>

                    <!-- Progress Bar (hidden on small screens) -->
                    <div class="hidden sm:block w-24 lg:w-32 shrink-0">
                      <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all"
                          :class="getProgressColorClass(child.percentage)"
                          :style="{ width: Math.min(child.percentage, 100) + '%' }"
                        />
                      </div>
                    </div>

                    <!-- Percentage -->
                    <div class="w-12 text-right shrink-0">
                      <span class="text-xs" :class="getPercentageClass(child.percentage)">
                        {{ child.percentage.toFixed(0) }}%
                      </span>
                    </div>

                    <!-- Actions Menu -->
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0">
                          <MoreVertical class="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="editCategory(child)">
                          <Pencil class="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="viewTransactions(child)">
                          <Receipt class="w-4 h-4 mr-2" />
                          View Transactions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="text-destructive" @click="confirmDeleteCategory(child)">
                          <Trash2 class="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </template>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Add/Edit Category Sheet (mobile-first bottom sheet) -->
    <Sheet v-model:open="showCategoryDialog">
      <SheetContent side="bottom" class="h-[90vh] rounded-t-2xl">
        <SheetHeader class="text-center pb-4">
          <SheetTitle class="text-xl font-bold">
            {{ isEditing ? 'Edit Category' : 'Add Category' }}
          </SheetTitle>
          <SheetDescription class="sr-only">
            {{ isEditing ? 'Edit category details' : 'Create a new category' }}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="h-[calc(90vh-160px)] pr-4">
          <div class="space-y-5 pb-6">
            <!-- Category Name -->
            <div class="space-y-2">
              <Label for="category-name">Category Name *</Label>
              <Input
                id="category-name"
                v-model="categoryForm.name"
                placeholder="e.g., Groceries, Rent, Entertainment"
              />
            </div>

            <!-- Category Type -->
            <div class="space-y-2">
              <Label>Type</Label>
              <Select v-model="categoryForm.type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Parent Category -->
            <div class="space-y-2">
              <Label>Parent Category (Optional)</Label>
              <Select v-model="categoryForm.parent_id">
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in parentCategoryOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <!-- Icon Selection -->
            <div class="space-y-2">
              <Label class="text-sm">Icon</Label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="icon in categoriesStore.icons.slice(0, 18)"
                  :key="icon.name"
                  :class="[
                    'flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all',
                    categoryForm.icon === icon.name
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent bg-muted hover:bg-accent'
                  ]"
                  @click="categoryForm.icon = icon.name"
                >
                  <Tag class="w-5 h-5" :class="categoryForm.icon === icon.name ? 'text-primary' : 'text-muted-foreground'" />
                </button>
              </div>
            </div>

            <!-- Color Selection -->
            <div class="space-y-2">
              <Label class="text-sm">Color</Label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in categoriesStore.colors"
                  :key="color.value"
                  class="w-9 h-9 rounded-lg transition-all"
                  :class="categoryForm.color === color.value ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'"
                  :style="{ backgroundColor: color.value }"
                  @click="categoryForm.color = color.value"
                />
              </div>
            </div>

            <Separator />

            <!-- Budget Amount -->
            <div class="space-y-2">
              <Label for="budget-amount">Monthly Budget (Optional)</Label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="budget-amount"
                  v-model.number="categoryForm.budget_amount"
                  type="number"
                  step="0.01"
                  class="pl-7"
                  placeholder="0.00"
                />
              </div>
              <p class="text-xs text-muted-foreground">
                Set a monthly budget limit for this category
              </p>
            </div>
          </div>
        </ScrollArea>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" @click="showCategoryDialog = false">Cancel</Button>
          <Button
            @click="saveCategory"
            :disabled="categoriesStore.loading || !categoryForm.name.trim()"
          >
            <Loader2 v-if="categoriesStore.loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ isEditing ? 'Update Category' : 'Add Category' }}
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle class="w-5 h-5 text-red-600" />
            </div>
            Delete Category
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div class="py-4 space-y-2">
          <p class="text-sm">
            Are you sure you want to delete "<span class="font-semibold">{{ categoryToDelete?.name }}</span>"?
          </p>
          <p class="text-xs text-muted-foreground">
            If the category has transactions, you'll need to reassign them first.
          </p>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="showDeleteDialog = false">Cancel</Button>
          <Button variant="destructive" @click="deleteCategory" :disabled="categoriesStore.loading">
            <Loader2 v-if="categoriesStore.loading" class="w-4 h-4 mr-2 animate-spin" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- FAB -->
    <Button
      class="fixed bottom-24 right-6 lg:bottom-6 w-14 h-14 rounded-full shadow-lg z-50"
      size="icon"
      @click="openAddCategoryDialog"
    >
      <Plus class="w-6 h-6" />
    </Button>
  </div>
</template>

<style scoped>
/* All styles are now handled by Tailwind CSS classes */
</style>
