<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoriesStore } from 'src/stores/categories';
import type { CategoryWithSpending } from 'src/services/categories.service';

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
  if (percentage >= 100) return 'text-negative text-weight-bold';
  if (percentage >= 90) return 'text-warning text-weight-bold';
  if (percentage >= 75) return 'text-orange';
  return 'text-grey-7';
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
  <q-page class="q-pa-md">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="text-h4 text-weight-bold q-mb-xs">Categories</h4>
        <p class="text-grey-7">Organize your transactions with custom categories and budgets</p>
      </div>
      <q-btn color="primary" icon="add" label="Add Category" @click="openAddCategoryDialog" />
    </div>

    <!-- Summary Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-avatar color="primary" text-color="white" icon="category" size="40px" class="q-mr-md" />
              <div>
                <div class="text-h5 text-weight-bold">{{ categoriesStore.totalCategories }}</div>
                <div class="text-caption text-grey-6">Total Categories</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-avatar color="positive" text-color="white" icon="attach_money" size="40px" class="q-mr-md" />
              <div>
                <div class="text-h5 text-weight-bold">
                  {{ categoriesStore.formatCurrency(categoriesStore.totalBudget) }}
                </div>
                <div class="text-caption text-grey-6">Total Budget</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-avatar color="warning" text-color="white" icon="trending_up" size="40px" class="q-mr-md" />
              <div>
                <div class="text-h5 text-weight-bold">
                  {{ categoriesStore.formatCurrency(categoriesStore.totalSpent) }}
                </div>
                <div class="text-caption text-grey-6">Total Spent</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <q-avatar color="info" text-color="white" icon="receipt" size="40px" class="q-mr-md" />
              <div>
                <div class="text-h5 text-weight-bold">{{ categoriesStore.totalTransactions }}</div>
                <div class="text-caption text-grey-6">Transactions</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Search and Actions -->
    <div class="row items-center q-mb-md q-gutter-sm">
      <q-input v-model="searchQuery" placeholder="Search categories..." outlined dense class="col-12 col-md-4">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-icon v-if="searchQuery" name="close" class="cursor-pointer" @click="searchQuery = ''" />
        </template>
      </q-input>

      <q-space />

      <q-btn flat icon="unfold_more" label="Expand All" @click="categoriesStore.expandAll" />
      <q-btn flat icon="unfold_less" label="Collapse All" @click="categoriesStore.collapseAll" />
      <q-btn color="primary" icon="add" label="Add Category" @click="openAddCategoryDialog" />
    </div>

    <!-- Categories List -->
    <q-card>
      <q-card-section class="q-pa-none">
        <div v-if="categoriesStore.loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="50px" />
          <div class="text-subtitle2 q-mt-md">Loading categories...</div>
        </div>

        <div v-else-if="filteredCategories.length === 0" class="text-center q-pa-lg">
          <q-icon name="category" size="64px" color="grey-5" />
          <div class="text-h6 q-mt-md">No categories found</div>
          <div class="text-body2 text-grey-6 q-mb-md">
            {{ searchQuery ? 'Try adjusting your search' : 'Create your first category to get started' }}
          </div>
          <q-btn v-if="!searchQuery" color="primary" @click="openAddCategoryDialog">
            Create Category
          </q-btn>
        </div>

        <div v-else class="categories-list">
          <!-- Category Items -->
          <template v-for="category in filteredCategories" :key="category.id">
            <!-- Parent Category -->
            <div class="category-item" :class="{ 'has-children': category.has_children }">
              <div class="row items-center q-pa-md">
                <!-- Checkbox -->
                <q-checkbox v-model="selectedCategories" :val="category.id" class="q-mr-sm" />

                <!-- Expand/Collapse Button -->
                <q-btn v-if="category.has_children" flat round dense
                  :icon="categoriesStore.isExpanded(category.id) ? 'expand_less' : 'expand_more'"
                  @click="categoriesStore.toggleExpand(category.id)" class="q-mr-sm" />
                <div v-else class="q-mr-lg" style="width: 40px;" />

                <!-- Category Icon & Name -->
                <q-avatar :style="{ backgroundColor: category.color + '20' }" size="40px" class="q-mr-md">
                  <q-icon :name="category.icon" :style="{ color: category.color }" />
                </q-avatar>

                <div class="col">
                  <div class="row items-center">
                    <span class="text-subtitle1 text-weight-medium">{{ category.name }}</span>
                    <span class="text-caption text-grey-6 q-ml-sm">
                      {{ category.transaction_count }} transactions
                    </span>
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ categoriesStore.formatCurrency(category.total_spent) }} /
                    {{ categoriesStore.formatCurrency(category.budget_amount) }}
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="col-3 q-px-md">
                  <q-linear-progress :value="Math.min(category.percentage / 100, 1)"
                    :color="categoriesStore.getProgressColor(category.percentage)" size="8px" rounded />
                </div>

                <!-- Percentage -->
                <div class="text-right" style="width: 60px;">
                  <span :class="getPercentageClass(category.percentage)">
                    {{ category.percentage.toFixed(0) }}%
                  </span>
                </div>

                <!-- Actions Menu -->
                <q-btn flat round icon="more_vert" class="q-ml-sm">
                  <q-menu>
                    <q-list style="min-width: 150px;">
                      <q-item clickable v-close-popup @click="editCategory(category)">
                        <q-item-section avatar>
                          <q-icon name="edit" />
                        </q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="viewTransactions(category)">
                        <q-item-section avatar>
                          <q-icon name="receipt" />
                        </q-item-section>
                        <q-item-section>View Transactions</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item clickable v-close-popup @click="confirmDeleteCategory(category)">
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section class="text-negative">Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <!-- Children Categories (Subcategories) -->
              <q-slide-transition>
                <div v-show="category.has_children && categoriesStore.isExpanded(category.id)">
                  <div v-for="child in category.children" :key="child.id" class="category-item child-category">
                    <div class="row items-center q-pa-md q-pl-xl">
                      <!-- Checkbox -->
                      <q-checkbox v-model="selectedCategories" :val="child.id" class="q-mr-sm" />

                      <div class="q-mr-lg" style="width: 40px;" />

                      <!-- Category Icon & Name -->
                      <q-avatar :style="{ backgroundColor: child.color + '20' }" size="36px" class="q-mr-md">
                        <q-icon :name="child.icon" :style="{ color: child.color }" size="20px" />
                      </q-avatar>

                      <div class="col">
                        <div class="row items-center">
                          <span class="text-body1 text-weight-medium">{{ child.name }}</span>
                          <span class="text-caption text-grey-6 q-ml-sm">
                            {{ child.transaction_count }} transactions
                          </span>
                        </div>
                        <div class="text-caption text-grey-6">
                          {{ categoriesStore.formatCurrency(child.total_spent) }} /
                          {{ categoriesStore.formatCurrency(child.budget_amount) }}
                        </div>
                      </div>

                      <!-- Progress Bar -->
                      <div class="col-3 q-px-md">
                        <q-linear-progress :value="Math.min(child.percentage / 100, 1)"
                          :color="categoriesStore.getProgressColor(child.percentage)" size="6px" rounded />
                      </div>

                      <!-- Percentage -->
                      <div class="text-right" style="width: 60px;">
                        <span :class="getPercentageClass(child.percentage)">
                          {{ child.percentage.toFixed(0) }}%
                        </span>
                      </div>

                      <!-- Actions Menu -->
                      <q-btn flat round icon="more_vert" size="sm" class="q-ml-sm">
                        <q-menu>
                          <q-list style="min-width: 150px;">
                            <q-item clickable v-close-popup @click="editCategory(child)">
                              <q-item-section avatar>
                                <q-icon name="edit" />
                              </q-item-section>
                              <q-item-section>Edit</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="viewTransactions(child)">
                              <q-item-section avatar>
                                <q-icon name="receipt" />
                              </q-item-section>
                              <q-item-section>View Transactions</q-item-section>
                            </q-item>
                            <q-separator />
                            <q-item clickable v-close-popup @click="confirmDeleteCategory(child)">
                              <q-item-section avatar>
                                <q-icon name="delete" color="negative" />
                              </q-item-section>
                              <q-item-section class="text-negative">Delete</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </q-slide-transition>
            </div>
          </template>
        </div>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Category Dialog -->
    <q-dialog v-model="showCategoryDialog" persistent>
      <q-card style="min-width: 450px;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ isEditing ? 'Edit Category' : 'Add Category' }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit.prevent="saveCategory">
            <q-input v-model="categoryForm.name" label="Category Name *" outlined class="q-mb-md"
              placeholder="e.g., Groceries, Rent, Entertainment"
              :rules="[(val) => !!val || 'Category name is required']" />

            <q-select v-model="categoryForm.parent_id" :options="parentCategoryOptions"
              label="Parent Category (Optional)" outlined clearable emit-value map-options class="q-mb-md" />

            <!-- Icon Selection -->
            <div class="q-mb-md">
              <div class="text-caption text-grey-7 q-mb-sm">Icon</div>
              <div class="row q-gutter-sm">
                <q-btn v-for="icon in categoriesStore.icons.slice(0, 18)" :key="icon.name" flat round :icon="icon.name"
                  :color="categoryForm.icon === icon.name ? 'primary' : 'grey'"
                  :class="{ 'bg-primary-1': categoryForm.icon === icon.name }" @click="categoryForm.icon = icon.name" />
              </div>
            </div>

            <!-- Color Selection -->
            <div class="q-mb-md">
              <div class="text-caption text-grey-7 q-mb-sm">Color</div>
              <div class="row q-gutter-sm">
                <q-btn v-for="color in categoriesStore.colors" :key="color.value" flat round :style="{
                  backgroundColor: color.value,
                  border: categoryForm.color === color.value ? '3px solid #333' : 'none',
                }" @click="categoryForm.color = color.value" class="color-btn" />
              </div>
            </div>

            <q-input v-model.number="categoryForm.budget_amount" type="number" label="Monthly Budget (Optional)"
              outlined prefix="$" hint="Set a monthly budget limit for this category" />
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn :color="isEditing ? 'warning' : 'primary'" :label="isEditing ? 'Update Category' : 'Add Category'"
            @click="saveCategory" :loading="categoriesStore.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px;">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Delete Category</span>
        </q-card-section>

        <q-card-section>
          Are you sure you want to delete "{{ categoryToDelete?.name }}"?
          <br /><br />
          <span class="text-caption text-grey-7">
            This action cannot be undone. If the category has transactions, you'll need to reassign them first.
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="negative" label="Delete" @click="deleteCategory" :loading="categoriesStore.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- FAB -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="openAddCategoryDialog" />
    </q-page-sticky>
  </q-page>
</template>

<style scoped lang="scss">
.categories-list {
  .category-item {
    border-bottom: 1px solid #e0e0e0;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    &:last-child {
      border-bottom: none;
    }

    &.child-category {
      background-color: #fafafa;

      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
}

.color-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 8px;
}
</style>
