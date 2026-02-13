<template>
  <div class="p-4 space-y-4">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-2xl font-bold mb-1">Budget Management</h4>
        <p class="text-sm text-muted-foreground">Track spending and manage budget allocations</p>
      </div>
      <Button @click="openCreateBudgetDialog">
        <Plus class="w-4 h-4" />
        Create Budget
      </Button>
    </div>

    <!-- Period Budget Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Monthly Budget Card -->
      <Card class="hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <CardContent class="pt-6">
          <div class="flex items-center justify-between mb-2">
            <div>
              <div class="text-sm font-medium">Monthly Budget</div>
              <div class="text-xs text-muted-foreground">
                {{ budgetsStore.monthlyBudget?.period || 'December 2025' }}
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" @click="editPeriodBudget('monthly')">
              <Pencil class="w-4 h-4" />
            </Button>
          </div>
          <div class="text-2xl font-bold mb-2">
            {{ budgetsStore.formatCurrency(budgetsStore.monthlyBudget?.total_spent || 0) }}
            <span class="text-sm font-normal text-muted-foreground">
              of {{ budgetsStore.formatCurrency(budgetsStore.monthlyBudget?.total_budget || 0) }}
            </span>
          </div>
          <div class="h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div
              class="h-full rounded-full transition-all"
              :class="getProgressBarColor(budgetsStore.monthlyBudget?.percentage_used || 0)"
              :style="{ width: Math.min(budgetsStore.monthlyBudget?.percentage_used || 0, 100) + '%' }"
            />
          </div>
          <div class="flex justify-between text-xs">
            <span :class="getPercentageClass(budgetsStore.monthlyBudget?.percentage_used || 0)">
              {{ (budgetsStore.monthlyBudget?.percentage_used || 0).toFixed(1) }}% used
            </span>
            <span class="text-green-600">
              {{ budgetsStore.formatCurrency(budgetsStore.monthlyBudget?.remaining || 0) }} remaining
            </span>
          </div>
        </CardContent>
      </Card>

      <!-- Quarterly Budget Card -->
      <Card class="hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <CardContent class="pt-6">
          <div class="flex items-center justify-between mb-2">
            <div>
              <div class="text-sm font-medium">Quarterly Budget</div>
              <div class="text-xs text-muted-foreground">
                {{ budgetsStore.quarterlyBudget?.period || 'Q4 2025' }}
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" @click="editPeriodBudget('quarterly')">
              <Pencil class="w-4 h-4" />
            </Button>
          </div>
          <div class="text-2xl font-bold mb-2">
            {{ budgetsStore.formatCurrency(budgetsStore.quarterlyBudget?.total_spent || 0) }}
            <span class="text-sm font-normal text-muted-foreground">
              of {{ budgetsStore.formatCurrency(budgetsStore.quarterlyBudget?.total_budget || 0) }}
            </span>
          </div>
          <div class="h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div
              class="h-full rounded-full transition-all"
              :class="getProgressBarColor(budgetsStore.quarterlyBudget?.percentage_used || 0)"
              :style="{ width: Math.min(budgetsStore.quarterlyBudget?.percentage_used || 0, 100) + '%' }"
            />
          </div>
          <div class="flex justify-between text-xs">
            <span :class="getPercentageClass(budgetsStore.quarterlyBudget?.percentage_used || 0)">
              {{ (budgetsStore.quarterlyBudget?.percentage_used || 0).toFixed(1) }}% used
            </span>
            <span class="text-green-600">
              {{ budgetsStore.formatCurrency(budgetsStore.quarterlyBudget?.remaining || 0) }} remaining
            </span>
          </div>
        </CardContent>
      </Card>

      <!-- Yearly Budget Card -->
      <Card class="hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <CardContent class="pt-6">
          <div class="flex items-center justify-between mb-2">
            <div>
              <div class="text-sm font-medium">Yearly Budget</div>
              <div class="text-xs text-muted-foreground">
                {{ budgetsStore.yearlyBudget?.period || '2025' }}
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" @click="editPeriodBudget('yearly')">
              <Pencil class="w-4 h-4" />
            </Button>
          </div>
          <div class="text-2xl font-bold mb-2">
            {{ budgetsStore.formatCurrency(budgetsStore.yearlyBudget?.total_spent || 0) }}
            <span class="text-sm font-normal text-muted-foreground">
              of {{ budgetsStore.formatCurrency(budgetsStore.yearlyBudget?.total_budget || 0) }}
            </span>
          </div>
          <div class="h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div
              class="h-full rounded-full transition-all"
              :class="getProgressBarColor(budgetsStore.yearlyBudget?.percentage_used || 0)"
              :style="{ width: Math.min(budgetsStore.yearlyBudget?.percentage_used || 0, 100) + '%' }"
            />
          </div>
          <div class="flex justify-between text-xs">
            <span :class="getPercentageClass(budgetsStore.yearlyBudget?.percentage_used || 0)">
              {{ (budgetsStore.yearlyBudget?.percentage_used || 0).toFixed(1) }}% used
            </span>
            <span class="text-green-600">
              {{ budgetsStore.formatCurrency(budgetsStore.yearlyBudget?.remaining || 0) }} remaining
            </span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
      <!-- Left Column - Chart and Category Breakdown -->
      <div class="space-y-4">
        <!-- Budget vs Actual Chart -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center mb-4">
              <BarChart3 class="w-6 h-6 text-primary mr-2" />
              <div>
                <div class="text-sm font-medium">Budget vs Actual</div>
                <div class="text-xs text-muted-foreground">Compare budgeted vs actual spending</div>
              </div>
            </div>
            <div class="py-4" style="height: 300px;">
              <!-- Chart placeholder - integrate with Chart.js or similar -->
              <div class="flex items-end justify-around h-full">
                <div
                  v-for="item in budgetsStore.comparison"
                  :key="item.category"
                  class="flex flex-col items-center"
                  style="width: 80px;"
                >
                  <div class="flex items-end" style="height: 200px;">
                    <div
                      class="bg-green-500 mr-0.5"
                      :style="{
                        width: '30px',
                        height: `${Math.min((item.budget / maxBudget) * 180, 180)}px`,
                        borderRadius: '4px 4px 0 0',
                      }"
                    />
                    <div
                      class="bg-blue-500"
                      :style="{
                        width: '30px',
                        height: `${Math.min((item.spent / maxBudget) * 180, 180)}px`,
                        borderRadius: '4px 4px 0 0',
                      }"
                    />
                  </div>
                  <div class="text-xs text-center mt-2" style="max-width: 80px;">
                    {{ truncateText(item.category, 10) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-center gap-4 mt-4">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-green-500 mr-1.5" />
                <span class="text-xs">Budget</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-blue-500 mr-1.5" />
                <span class="text-xs">Spent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Category Breakdown -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <Tag class="w-6 h-6 text-primary mr-2" />
                <div>
                  <div class="text-sm font-medium">Category Breakdown</div>
                  <div class="text-xs text-muted-foreground">Individual category budgets</div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <SlidersHorizontal class="w-4 h-4" />
                Export
              </Button>
            </div>

            <div v-if="budgetsStore.loading" class="flex justify-center py-8">
              <Loader2 class="w-10 h-10 text-primary animate-spin" />
            </div>

            <div v-else-if="budgetsStore.categoryBreakdown.length === 0" class="text-center py-8">
              <PieChart class="w-16 h-16 text-muted-foreground/50 mx-auto" />
              <div class="text-sm font-medium mt-4">No budget categories</div>
              <div class="text-xs text-muted-foreground mb-4">Create budget categories to track spending</div>
              <Button @click="openCreateBudgetDialog">Create Budget</Button>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                v-for="category in budgetsStore.categoryBreakdown"
                :key="category.id"
                class="border hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                <CardContent class="p-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center mr-2"
                        :style="{ backgroundColor: category.color + '20' }"
                      >
                        <component
                          :is="getCategoryIconComponent(category.icon)"
                          class="w-5 h-5"
                          :style="{ color: category.color }"
                        />
                      </div>
                      <div>
                        <div class="text-sm font-medium">{{ category.name }}</div>
                        <div class="text-xs text-muted-foreground">
                          {{ category.transaction_count }} transactions
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm" @click="editCategoryBudget(category)">
                      <Pencil class="w-4 h-4" />
                    </Button>
                  </div>

                  <div class="flex items-baseline justify-between mb-1">
                    <span
                      class="text-sm font-bold"
                      :class="category.status === 'over_budget' ? 'text-red-600' : ''"
                    >
                      {{ budgetsStore.formatCurrency(category.spent_amount) }}
                    </span>
                    <span class="text-xs text-muted-foreground">
                      / {{ budgetsStore.formatCurrency(category.budget_amount) }}
                    </span>
                  </div>

                  <div class="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="getProgressBarColor(category.percentage)"
                      :style="{ width: Math.min(category.percentage, 100) + '%' }"
                    />
                  </div>

                  <div class="flex justify-between text-xs">
                    <span :class="getPercentageClass(category.percentage)">
                      {{ category.percentage.toFixed(1) }}%
                    </span>
                    <span :class="category.remaining_amount >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ category.remaining_amount >= 0 ? '$' : '-$' }}{{
                        Math.abs(category.remaining_amount).toFixed(2) }}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column - Spending Velocity, Quick Adjustments, Alerts -->
      <div class="space-y-4">
        <!-- Spending Velocity -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center mb-4">
              <Gauge class="w-6 h-6 text-primary mr-2" />
              <div>
                <div class="text-sm font-medium">Spending Velocity</div>
                <div class="text-xs text-muted-foreground">Current spending rate analysis</div>
              </div>
            </div>

            <div class="mb-4">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-muted-foreground">Current Rate</span>
                <span class="font-bold" :class="getVelocityColor(budgetsStore.spendingVelocity?.current_rate)">
                  {{ budgetsStore.spendingVelocity?.current_rate || 'Normal' }}
                </span>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Daily Average</span>
                <span class="text-sm font-medium">
                  {{ budgetsStore.formatCurrency(budgetsStore.spendingVelocity?.daily_average || 0) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Projected Month-End</span>
                <span
                  class="text-sm font-medium"
                  :class="(budgetsStore.spendingVelocity?.projected_month_end || 0) > budgetsStore.totalBudgeted ? 'text-red-600' : 'text-green-600'"
                >
                  {{ budgetsStore.formatCurrency(budgetsStore.spendingVelocity?.projected_month_end || 0) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Days Remaining</span>
                <span class="text-sm font-medium">{{ budgetsStore.spendingVelocity?.days_remaining || 0 }}</span>
              </div>
            </div>

            <Alert
              v-if="budgetsStore.spendingVelocity?.warning"
              class="mt-4 border-yellow-500/50 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200"
            >
              <AlertTriangle class="w-4 h-4 text-yellow-600" />
              <AlertTitle>Budget Overrun Warning</AlertTitle>
              <AlertDescription>{{ budgetsStore.spendingVelocity?.warning?.message }}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <!-- Quick Adjustments -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center mb-4">
              <SlidersHorizontal class="w-6 h-6 text-primary mr-2" />
              <div>
                <div class="text-sm font-medium">Quick Adjustments</div>
                <div class="text-xs text-muted-foreground">Modify all budgets by percentage</div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                class="text-green-600 border-green-600 hover:bg-green-50"
                :disabled="budgetsStore.loading"
                @click="applyQuickAdjustment(5)"
              >
                <TrendingUp class="w-4 h-4" />
                +5%
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="text-green-600 border-green-600 hover:bg-green-50"
                :disabled="budgetsStore.loading"
                @click="applyQuickAdjustment(10)"
              >
                <TrendingUp class="w-4 h-4" />
                +10%
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="text-red-600 border-red-600 hover:bg-red-50"
                :disabled="budgetsStore.loading"
                @click="applyQuickAdjustment(-5)"
              >
                <TrendingDown class="w-4 h-4" />
                -5%
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="text-red-600 border-red-600 hover:bg-red-50"
                :disabled="budgetsStore.loading"
                @click="applyQuickAdjustment(-10)"
              >
                <TrendingDown class="w-4 h-4" />
                -10%
              </Button>
            </div>

            <div class="text-xs text-muted-foreground">
              Quick adjustments apply percentage changes to all category budgets proportionally.
            </div>
          </CardContent>
        </Card>

        <!-- Alert Configuration -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center mb-4">
              <Bell class="w-6 h-6 text-primary mr-2" />
              <div>
                <div class="text-sm font-medium">Alert Configuration</div>
                <div class="text-xs text-muted-foreground">Set thresholds for budget notifications</div>
              </div>
            </div>

            <!-- Budget Warning -->
            <div class="p-3 bg-muted/50 rounded-lg mb-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Checkbox
                    :checked="alertConfigLocal.budget_warning.enabled"
                    @update:checked="(val: boolean) => { alertConfigLocal.budget_warning.enabled = val; updateAlertConfig() }"
                  />
                  <span class="text-sm font-medium">Budget Warning</span>
                </div>
                <Badge class="bg-yellow-500 text-white hover:bg-yellow-500/80">warning</Badge>
              </div>
              <div class="pl-6 space-y-2">
                <div class="text-xs text-muted-foreground">Threshold Percentage</div>
                <Input
                  type="number"
                  :model-value="alertConfigLocal.budget_warning.threshold"
                  :disabled="!alertConfigLocal.budget_warning.enabled"
                  class="h-9"
                  @update:model-value="(val: string | number) => { alertConfigLocal.budget_warning.threshold = Number(val); updateAlertConfig() }"
                />
                <div class="text-xs text-muted-foreground">
                  Alert when spending reaches {{ alertConfigLocal.budget_warning.threshold }}% of budget
                </div>
                <div class="flex flex-wrap gap-3 mt-1">
                  <label class="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      :checked="alertConfigLocal.budget_warning.email_notification"
                      :disabled="!alertConfigLocal.budget_warning.enabled"
                      @update:checked="(val: boolean) => { alertConfigLocal.budget_warning.email_notification = val; updateAlertConfig() }"
                    />
                    Email notification
                  </label>
                  <label class="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      :checked="alertConfigLocal.budget_warning.push_notification"
                      :disabled="!alertConfigLocal.budget_warning.enabled"
                      @update:checked="(val: boolean) => { alertConfigLocal.budget_warning.push_notification = val; updateAlertConfig() }"
                    />
                    Push notification
                  </label>
                </div>
              </div>
            </div>

            <!-- Overspending Alert -->
            <div class="p-3 bg-muted/50 rounded-lg mb-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Checkbox
                    :checked="alertConfigLocal.overspending_alert.enabled"
                    @update:checked="(val: boolean) => { alertConfigLocal.overspending_alert.enabled = val; updateAlertConfig() }"
                  />
                  <span class="text-sm font-medium">Overspending Alert</span>
                </div>
                <Badge variant="destructive">critical</Badge>
              </div>
              <div class="pl-6 space-y-2">
                <div class="text-xs text-muted-foreground">Threshold Percentage</div>
                <Input
                  type="number"
                  :model-value="alertConfigLocal.overspending_alert.threshold"
                  :disabled="!alertConfigLocal.overspending_alert.enabled"
                  class="h-9"
                  @update:model-value="(val: string | number) => { alertConfigLocal.overspending_alert.threshold = Number(val); updateAlertConfig() }"
                />
                <div class="text-xs text-muted-foreground">
                  Alert when spending reaches {{ alertConfigLocal.overspending_alert.threshold }}% of budget
                </div>
                <div class="flex flex-wrap gap-3 mt-1">
                  <label class="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      :checked="alertConfigLocal.overspending_alert.email_notification"
                      :disabled="!alertConfigLocal.overspending_alert.enabled"
                      @update:checked="(val: boolean) => { alertConfigLocal.overspending_alert.email_notification = val; updateAlertConfig() }"
                    />
                    Email notification
                  </label>
                  <label class="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      :checked="alertConfigLocal.overspending_alert.push_notification"
                      :disabled="!alertConfigLocal.overspending_alert.enabled"
                      @update:checked="(val: boolean) => { alertConfigLocal.overspending_alert.push_notification = val; updateAlertConfig() }"
                    />
                    Push notification
                  </label>
                </div>
              </div>
            </div>

            <!-- Budget Exceeded -->
            <div class="p-3 bg-muted/50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <Checkbox
                    :checked="alertConfigLocal.budget_exceeded.enabled"
                    @update:checked="(val: boolean) => { alertConfigLocal.budget_exceeded.enabled = val; updateAlertConfig() }"
                  />
                  <span class="text-sm font-medium">Budget Exceeded</span>
                </div>
                <Badge variant="destructive">critical</Badge>
              </div>
              <div class="pl-6 space-y-2">
                <div class="text-xs text-muted-foreground">Threshold Percentage</div>
                <Input
                  type="number"
                  :model-value="alertConfigLocal.budget_exceeded.threshold"
                  :disabled="!alertConfigLocal.budget_exceeded.enabled"
                  class="h-9"
                  @update:model-value="(val: string | number) => { alertConfigLocal.budget_exceeded.threshold = Number(val); updateAlertConfig() }"
                />
                <div class="text-xs text-muted-foreground">
                  Alert when spending reaches {{ alertConfigLocal.budget_exceeded.threshold }}% of budget
                </div>
                <div class="flex flex-wrap gap-3 mt-1">
                  <label class="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      :checked="alertConfigLocal.budget_exceeded.email_notification"
                      :disabled="!alertConfigLocal.budget_exceeded.enabled"
                      @update:checked="(val: boolean) => { alertConfigLocal.budget_exceeded.email_notification = val; updateAlertConfig() }"
                    />
                    Email notification
                  </label>
                  <label class="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      :checked="alertConfigLocal.budget_exceeded.push_notification"
                      :disabled="!alertConfigLocal.budget_exceeded.enabled"
                      @update:checked="(val: boolean) => { alertConfigLocal.budget_exceeded.push_notification = val; updateAlertConfig() }"
                    />
                    Push notification
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Create Budget Sheet (bottom slide) -->
    <Sheet v-model:open="showCreateBudgetDialog">
      <SheetContent side="bottom" class="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle class="flex items-center gap-2">
            <PieChart class="w-5 h-5 text-primary" />
            Create New Budget
          </SheetTitle>
          <SheetDescription>
            Set up a new budget period and allocate amounts to categories.
          </SheetDescription>
        </SheetHeader>

        <form class="mt-6 space-y-4" @submit.prevent="createBudget">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Budget Period *</Label>
              <Select v-model="budgetForm.period">
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in periodOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Start Date *</Label>
              <Input v-model="budgetForm.start_date" type="date" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Total Budget Amount *</Label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                v-model.number="budgetForm.amount"
                type="number"
                class="pl-7"
                placeholder="0.00"
              />
            </div>
            <p class="text-xs text-muted-foreground">Enter the total amount for this budget period</p>
          </div>

          <Separator />

          <div>
            <h3 class="text-sm font-medium mb-3">Category Allocations</h3>
            <div
              v-for="category in categoriesStore.expenseCategories"
              :key="category.id"
              class="flex items-center mb-3"
            >
              <div class="flex items-center flex-1 min-w-0">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0"
                  :style="{ backgroundColor: category.color + '20' }"
                >
                  <component
                    :is="getCategoryIconComponent(category.icon)"
                    class="w-4 h-4"
                    :style="{ color: category.color }"
                  />
                </div>
                <span class="text-sm truncate">{{ category.name }}</span>
              </div>
              <div class="relative w-32 shrink-0 ml-2">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  :model-value="categoryAllocations[category.id]"
                  type="number"
                  class="pl-7 h-9"
                  placeholder="0.00"
                  @update:model-value="(val: string | number) => categoryAllocations[category.id] = Number(val)"
                />
              </div>
            </div>
          </div>
        </form>

        <SheetFooter class="mt-6">
          <SheetClose as-child>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button :disabled="budgetsStore.loading" @click="createBudget">
            <Loader2 v-if="budgetsStore.loading" class="w-4 h-4 animate-spin" />
            Create Budget
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

    <!-- FAB - Fixed bottom-right -->
    <Button
      class="fixed bottom-6 right-6 z-40 rounded-full shadow-lg h-14 w-14"
      size="icon-lg"
      @click="openCreateBudgetDialog"
    >
      <Plus class="w-6 h-6" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch, type Component, markRaw } from 'vue';
import { useBudgetsStore } from 'src/stores/budget';
import { useCategoriesStore } from 'src/stores/categories';
import { AlertConfig } from 'src/types/budget.types';

// shadcn-vue components
import { Card, CardContent } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Badge } from 'src/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from 'src/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from 'src/components/ui/sheet';
import { Checkbox } from 'src/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Separator } from 'src/components/ui/separator';

// Lucide icons
import {
  Plus,
  Pencil,
  BarChart3,
  Tag,
  Gauge,
  SlidersHorizontal,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
  PieChart,
  Circle,
} from 'lucide-vue-next';

const budgetsStore = useBudgetsStore();
const categoriesStore = useCategoriesStore();

// Dialog state
const showCreateBudgetDialog = ref(false);

// Budget form
const budgetForm = reactive({
  period: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  start_date: new Date().toISOString().split('T')[0],
  amount: 0,
});

const categoryAllocations = reactive<Record<number, number>>({});

const periodOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

// Alert config local state
const alertConfigLocal = reactive<AlertConfig>({
  budget_warning: {
    enabled: true,
    threshold: 75,
    email_notification: true,
    push_notification: true,
  },
  overspending_alert: {
    enabled: true,
    threshold: 90,
    email_notification: true,
    push_notification: true,
  },
  budget_exceeded: {
    enabled: true,
    threshold: 100,
    email_notification: true,
    push_notification: false,
  },
});

// Computed
const maxBudget = computed(() => {
  if (!budgetsStore.comparison.length) return 1000;
  return Math.max(...budgetsStore.comparison.map((c) => Math.max(c.budget, c.spent)));
});

// Watch for alert config changes from store
watch(
  () => budgetsStore.alertConfig,
  (newConfig) => {
    if (newConfig) {
      Object.assign(alertConfigLocal, newConfig);
    }
  },
  { immediate: true }
);

// Methods
const getPercentageClass = (percentage: number): string => {
  if (percentage >= 100) return 'text-red-600';
  if (percentage >= 90) return 'text-yellow-600';
  if (percentage >= 75) return 'text-orange-500';
  return 'text-green-600';
};

const getProgressBarColor = (percentage: number): string => {
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 90) return 'bg-yellow-500';
  if (percentage >= 75) return 'bg-orange-500';
  return 'bg-green-500';
};

const getVelocityColor = (rate?: string): string => {
  switch (rate) {
    case 'High':
      return 'text-red-600';
    case 'Normal':
      return 'text-yellow-600';
    case 'Low':
      return 'text-green-600';
    default:
      return 'text-muted-foreground';
  }
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Helper to get a lucide icon component for category icons
// Falls back to Circle if no matching icon found
const getCategoryIconComponent = (iconName: string): Component => {
  // For material-style icon names from the backend, use a fallback Circle icon
  // In production, you'd map these to actual lucide icons
  return markRaw(Circle);
};

const openCreateBudgetDialog = () => {
  // Reset form
  budgetForm.period = 'monthly';
  budgetForm.start_date = new Date().toISOString().split('T')[0];
  budgetForm.amount = 0;
  Object.keys(categoryAllocations).forEach((key) => delete categoryAllocations[Number(key)]);
  showCreateBudgetDialog.value = true;
};

const createBudget = async () => {
  try {
    // Create individual budgets for each category allocation
    for (const [categoryId, amount] of Object.entries(categoryAllocations)) {
      if (amount > 0) {
        await budgetsStore.createBudget({
          category_id: Number(categoryId),
          amount: amount,
          period: budgetForm.period,
          start_date: budgetForm.start_date,
        });
      }
    }
    showCreateBudgetDialog.value = false;
  } catch (err) {
    console.error('Failed to create budget:', err);
  }
};

const editPeriodBudget = (period: string) => {
  // TODO: Implement edit period budget dialog
  console.log('Edit period budget:', period);
};

const editCategoryBudget = (category: any) => {
  // TODO: Implement edit category budget dialog
  console.log('Edit category budget:', category);
};

const applyQuickAdjustment = async (percentage: number) => {
  try {
    await budgetsStore.applyQuickAdjustment(percentage, 'monthly');
  } catch (err) {
    console.error('Failed to apply quick adjustment:', err);
  }
};

const updateAlertConfig = async () => {
  try {
    await budgetsStore.updateAlertConfig(alertConfigLocal);
  } catch (err) {
    console.error('Failed to update alert config:', err);
  }
};

// Initialize data
onMounted(async () => {
  await Promise.all([
    budgetsStore.initializeBudgetData(),
    categoriesStore.fetchCategories({ type: 'expense' }),
  ]);
});
</script>
