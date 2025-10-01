<script setup>
// 對齊 SRS：物資捐贈表單（plan.md 7.3）
// 欄位：姓名、電話、物資名稱、捐贈數量、單位、預計送達時間、備註
// 使用 Pinia + persist 取代 localStorage
import { ref, computed } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Input from '@/components/ui/Input.vue'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserIcon, PhoneIcon, PackageIcon, HashIcon, ClockIcon } from 'lucide-vue-next'
import { useDonationFormStore } from '@/stores/forms'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  open: Boolean,
  demandId: String,
  demandTitle: String,
  supplyItems: Array // 從需求帶入的物資清單
})

const emit = defineEmits(['update:open', 'submit'])

const formStore = useDonationFormStore()
const toastStore = useToastStore()

// 使用 computed 來雙向綁定 Pinia store
const formData = computed(() => formStore.formData)

const isSubmitting = ref(false)
const errors = ref({})

// 驗證表單
function validateForm() {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = '請輸入姓名'
  }
  
  if (!formData.value.phone.trim()) {
    errors.value.phone = '請輸入電話'
  } else if (!/^[0-9-+\s()]+$/.test(formData.value.phone)) {
    errors.value.phone = '請輸入有效的電話號碼'
  }
  
  if (!formData.value.itemName.trim()) {
    errors.value.itemName = '請輸入物資名稱'
  }
  
  if (!formData.value.quantity.trim()) {
    errors.value.quantity = '請輸入數量'
  } else if (isNaN(formData.value.quantity) || Number(formData.value.quantity) <= 0) {
    errors.value.quantity = '請輸入有效的數量'
  }
  
  if (!formData.value.unit.trim()) {
    errors.value.unit = '請輸入單位'
  }
  
  return Object.keys(errors.value).length === 0
}

// 提交表單
async function handleSubmit() {
  if (!validateForm()) {
    toastStore.error('請檢查表單內容')
    return
  }
  
  isSubmitting.value = true
  
  try {
    // 對齊 SRS：donations 資料結構
    const submitData = {
      demandId: props.demandId,
      donor: {
        name: formData.value.name.trim(),
        phone: formData.value.phone.trim()
      },
      itemName: formData.value.itemName.trim(),
      quantity: Number(formData.value.quantity),
      unit: formData.value.unit.trim(),
      eta: formData.value.eta.trim(),
      note: formData.value.note.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    emit('submit', submitData)
    
    // 提交成功後清除表單
    formStore.reset()
    toastStore.success('捐贈登記成功！')
    
    emit('update:open', false)
  } catch (err) {
    console.error('提交失敗:', err)
    toastStore.error('提交失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

// 快速填入物資項目
function fillItem(item) {
  formStore.updateField('itemName', item.itemName)
  formStore.updateField('unit', item.unit)
  formStore.updateField('quantity', item.quantity.toString())
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>我要捐贈物資</DialogTitle>
        <DialogDescription>
          {{ demandTitle || '填寫以下資料以捐贈物資' }}
        </DialogDescription>
      </DialogHeader>
      
      <!-- 快速選擇物資（如果有提供需求清單） -->
      <Card v-if="supplyItems && supplyItems.length > 0" class="p-4 bg-gray-50">
        <p class="text-sm font-medium mb-3">需求物資清單（點擊快速填入）：</p>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="(item, index) in supplyItems"
            :key="index"
            type="button"
            variant="outline"
            size="sm"
            @click="fillItem(item)"
            class="text-sm"
          >
            {{ item.itemName }} ({{ item.quantity }} {{ item.unit }})
          </Button>
        </div>
      </Card>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 姓名和電話（同一行） -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="donor-name" class="flex items-center gap-2">
              <UserIcon class="w-4 h-4" />
              姓名 <span class="text-red-500">*</span>
            </Label>
            <Input
              id="donor-name"
              :model-value="formData.name"
              @update:model-value="formStore.updateField('name', $event)"
              placeholder="請輸入您的姓名"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="donor-phone" class="flex items-center gap-2">
              <PhoneIcon class="w-4 h-4" />
              電話 <span class="text-red-500">*</span>
            </Label>
            <Input
              id="donor-phone"
              :model-value="formData.phone"
              @update:model-value="formStore.updateField('phone', $event)"
              type="tel"
              placeholder="請輸入聯絡電話"
              :class="{ 'border-red-500': errors.phone }"
            />
            <p v-if="errors.phone" class="text-sm text-red-500">{{ errors.phone }}</p>
          </div>
        </div>
        
        <!-- 物資名稱 -->
        <div class="space-y-2">
          <Label for="itemName" class="flex items-center gap-2">
            <PackageIcon class="w-4 h-4" />
            物資名稱 <span class="text-red-500">*</span>
          </Label>
          <Input
            id="itemName"
            :model-value="formData.itemName"
            @update:model-value="formStore.updateField('itemName', $event)"
            placeholder="例：瓶裝水、口罩、睡袋"
            :class="{ 'border-red-500': errors.itemName }"
          />
          <p v-if="errors.itemName" class="text-sm text-red-500">{{ errors.itemName }}</p>
        </div>
        
        <!-- 數量和單位 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="quantity" class="flex items-center gap-2">
              <HashIcon class="w-4 h-4" />
              數量 <span class="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              :model-value="formData.quantity"
              @update:model-value="formStore.updateField('quantity', $event)"
              type="number"
              min="1"
              placeholder="100"
              :class="{ 'border-red-500': errors.quantity }"
            />
            <p v-if="errors.quantity" class="text-sm text-red-500">{{ errors.quantity }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="unit">
              單位 <span class="text-red-500">*</span>
            </Label>
            <Input
              id="unit"
              :model-value="formData.unit"
              @update:model-value="formStore.updateField('unit', $event)"
              placeholder="例：箱、個、包"
              :class="{ 'border-red-500': errors.unit }"
            />
            <p v-if="errors.unit" class="text-sm text-red-500">{{ errors.unit }}</p>
          </div>
        </div>
        
        <!-- 預計送達時間 -->
        <div class="space-y-2">
          <Label for="eta" class="flex items-center gap-2">
            <ClockIcon class="w-4 h-4" />
            預計送達時間
          </Label>
          <Input
            id="eta"
            :model-value="formData.eta"
            @update:model-value="formStore.updateField('eta', $event)"
            placeholder="例：明天下午、本週五"
          />
          <p class="text-xs text-gray-500">選填，方便需求方安排接收</p>
        </div>
        
        <!-- 備註 -->
        <div class="space-y-2">
          <Label for="donation-note">備註</Label>
          <Textarea
            id="donation-note"
            :model-value="formData.note"
            @update:model-value="formStore.updateField('note', $event)"
            placeholder="其他補充說明"
            :rows="3"
          />
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="emit('update:open', false)"
            :disabled="isSubmitting"
          >
            取消
          </Button>
          <Button
            type="submit"
            class="bg-green-600 hover:bg-green-700"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '確認捐贈' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
