<script setup>
// 對齊 SRS：需求建立表單（plan.md 10, 12）
// 支援：人力需求、物資需求、場站資訊（污泥暫置場、物資停放處、住宿地點、領吃食區域）
import { ref, computed, watch } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  HashIcon,
  AlertTriangleIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-vue-next";
import { useToastStore } from "@/stores/toast";
import MapPicker from "@/components/Map/MapPicker.vue";

const props = defineProps({
  open: Boolean,
  // 如果提供 initialData，則為編輯模式
  initialData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:open", "submit"]);

const toastStore = useToastStore();

// 類型選項
const typeOptions = [
  { value: "human", label: "人力任務" },
  { value: "supply", label: "物資需求" },
  { value: "site-holding", label: "污泥暫置場" },
  { value: "site-parking", label: "物資停放處" },
  { value: "site-stay", label: "住宿地點" },
  { value: "site-food", label: "領吃食區域" },
];

// 表單資料
const formData = ref({
  type: "human",
  title: "",
  description: "",
  region: "",
  location: {
    lat: null,
    lng: null,
    address: "",
  },
  contact: {
    name: "",
    phone: "",
    email: "",
  },
  // 人力需求專屬
  humanNeed: {
    required: "",
    riskNotes: "",
  },
  // 物資需求專屬（支援多項物資）
  supplyItems: [{ itemName: "", quantity: "", unit: "" }],
});

const isSubmitting = ref(false);
const errors = ref({});
const showMapPicker = ref(false);

// 當 initialData 變化時，更新表單
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = { ...formData.value, ...newData };
    }
  },
  { immediate: true },
);

// 計算屬性：是否為場站類型
const isSiteType = computed(() => {
  return formData.value.type.startsWith("site-");
});

// 計算屬性：是否為人力需求
const isHumanType = computed(() => {
  return formData.value.type === "human";
});

// 計算屬性：是否為物資需求
const isSupplyType = computed(() => {
  return formData.value.type === "supply";
});

// 當類型變更時，清空相關欄位
watch(
  () => formData.value.type,
  (newType, oldType) => {
    if (newType !== oldType) {
      if (newType !== "human") {
        formData.value.humanNeed = { required: "", riskNotes: "" };
      }
      if (newType !== "supply") {
        formData.value.supplyItems = [{ itemName: "", quantity: "", unit: "" }];
      }
    }
  },
);

// 物資項目管理
function addSupplyItem() {
  formData.value.supplyItems.push({ itemName: "", quantity: "", unit: "" });
}

function removeSupplyItem(index) {
  if (formData.value.supplyItems.length > 1) {
    formData.value.supplyItems.splice(index, 1);
  }
}

// 驗證表單
function validateForm() {
  errors.value = {};

  if (!formData.value.type) {
    errors.value.type = "請選擇類型";
  }

  if (!formData.value.region.trim()) {
    errors.value.region = "請輸入所屬災區/區域";
  }

  if (!formData.value.location.address.trim()) {
    errors.value.address = "請輸入地點";
  }

  if (!formData.value.contact.name.trim()) {
    errors.value.contactName = "請輸入聯絡人姓名";
  }

  if (!formData.value.contact.phone.trim()) {
    errors.value.contactPhone = "請輸入聯絡電話";
  } else if (!/^[0-9-+\s()]+$/.test(formData.value.contact.phone)) {
    errors.value.contactPhone = "請輸入有效的電話號碼";
  }

  if (
    formData.value.contact.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.contact.email)
  ) {
    errors.value.contactEmail = "請輸入有效的 Email";
  }

  // 人力需求驗證
  if (isHumanType.value) {
    if (
      !formData.value.humanNeed.required ||
      Number(formData.value.humanNeed.required) <= 0
    ) {
      errors.value.humanRequired = "請輸入所需人數";
    }
  }

  // 物資需求驗證
  if (isSupplyType.value) {
    formData.value.supplyItems.forEach((item, index) => {
      if (!item.itemName.trim()) {
        errors.value[`supplyItem${index}Name`] = "請輸入物資名稱";
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        errors.value[`supplyItem${index}Quantity`] = "請輸入數量";
      }
      if (!item.unit.trim()) {
        errors.value[`supplyItem${index}Unit`] = "請輸入單位";
      }
    });
  }

  return Object.keys(errors.value).length === 0;
}

// 提交表單
async function handleSubmit() {
  if (!validateForm()) {
    toastStore.error("請檢查表單內容");
    return;
  }

  isSubmitting.value = true;

  try {
    // 對齊 SRS：demands 資料結構（plan.md 10）
    const submitData = {
      type: formData.value.type,
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      region: formData.value.region.trim(),
      location: {
        lat: formData.value.location.lat,
        lng: formData.value.location.lng,
        address: formData.value.location.address.trim(),
      },
      contact: {
        name: formData.value.contact.name.trim(),
        phone: formData.value.contact.phone.trim(),
        email: formData.value.contact.email.trim(),
      },
      status: "pending", // 對齊 SRS：新建需求狀態為 pending，等待審核
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoApproved: false,
    };

    // 根據類型添加專屬欄位
    if (isHumanType.value) {
      submitData.humanNeed = {
        required: Number(formData.value.humanNeed.required),
        riskNotes: formData.value.humanNeed.riskNotes.trim(),
      };
    } else if (isSupplyType.value) {
      submitData.supplyItems = formData.value.supplyItems.map((item) => ({
        itemName: item.itemName.trim(),
        quantity: Number(item.quantity),
        unit: item.unit.trim(),
      }));
    }

    emit("submit", submitData);

    // 清空表單
    resetForm();

    emit("update:open", false);
  } catch (err) {
    console.error("提交失敗:", err);
    toastStore.error("提交失敗，請稍後再試");
  } finally {
    isSubmitting.value = false;
  }
}

// 重置表單
function resetForm() {
  formData.value = {
    type: "human",
    description: "",
    region: "",
    location: {
      lat: null,
      lng: null,
      address: "",
    },
    contact: {
      name: "",
      phone: "",
      email: "",
    },
    humanNeed: {
      required: "",
      riskNotes: "",
    },
    supplyItems: [{ itemName: "", quantity: "", unit: "" }],
  };
  errors.value = {};
}

// 開啟地圖選點
function openMapPicker() {
  showMapPicker.value = true;
}

// 處理地圖選點結果
function handleLocationSelect(location) {
  formData.value.location = {
    lat: location.lat,
    lng: location.lng,
    address: location.address,
  };
  toastStore.success("已選擇地點");
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] h-[85vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b">
        <DialogTitle>{{
          initialData ? "編輯需求" : "新增需求或地點"
        }}</DialogTitle>
        <DialogDescription>
          請填寫以下資訊以建立新的需求或場站資訊。提交後將進入審核流程。
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 px-6">
        <form @submit.prevent="handleSubmit" class="space-y-6 py-4 px-1">
          <!-- 類型選擇 -->
          <div class="space-y-2">
            <Label for="type" class="flex items-center gap-2">
              類型 <span class="text-red-500">*</span>
            </Label>
            <Select v-model="formData.type">
              <SelectTrigger :class="{ 'border-red-500': errors.type }">
                <SelectValue placeholder="選擇類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="option in typeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p v-if="errors.type" class="text-sm text-red-500">
              {{ errors.type }}
            </p>
          </div>

          <!-- 所屬災區/區域 -->
          <div class="space-y-2">
            <Label for="region" class="flex items-center gap-2">
              所屬災區/區域 <span class="text-red-500">*</span>
            </Label>
            <Input
              id="region"
              v-model="formData.region"
              placeholder="例：台南市、高雄市旗山區"
              :class="{ 'border-red-500': errors.region }"
            />
            <p v-if="errors.region" class="text-sm text-red-500">
              {{ errors.region }}
            </p>
          </div>

          <!-- 地點 -->
          <Card class="p-4 space-y-3">
            <div class="flex items-center justify-between">
              <Label class="flex items-center gap-2">
                <MapPinIcon class="w-4 h-4" />
                集合/場站地點 <span class="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                @click="openMapPicker"
              >
                從地圖選點
              </Button>
            </div>
            <Input
              v-model="formData.location.address"
              placeholder="請輸入詳細地址"
              :class="{ 'border-red-500': errors.address }"
            />
            <p v-if="errors.address" class="text-sm text-red-500">
              {{ errors.address }}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <Input
                v-model="formData.location.lat"
                type="number"
                step="any"
                placeholder="緯度 (選填)"
              />
              <Input
                v-model="formData.location.lng"
                type="number"
                step="any"
                placeholder="經度 (選填)"
              />
            </div>
          </Card>

          <!-- 聯絡方式 -->
          <Card class="p-4 space-y-3">
            <Label class="flex items-center gap-2 mb-2">
              <UserIcon class="w-4 h-4" />
              聯絡方式
            </Label>
            <div class="space-y-2">
              <Input
                v-model="formData.contact.name"
                placeholder="聯絡人姓名 *"
                :class="{ 'border-red-500': errors.contactName }"
              />
              <p v-if="errors.contactName" class="text-sm text-red-500">
                {{ errors.contactName }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-2">
                <Input
                  v-model="formData.contact.phone"
                  type="tel"
                  placeholder="聯絡電話 *"
                  :class="{ 'border-red-500': errors.contactPhone }"
                />
                <p v-if="errors.contactPhone" class="text-sm text-red-500">
                  {{ errors.contactPhone }}
                </p>
              </div>
              <div class="space-y-2">
                <Input
                  v-model="formData.contact.email"
                  type="email"
                  placeholder="Email (選填)"
                  :class="{ 'border-red-500': errors.contactEmail }"
                />
                <p v-if="errors.contactEmail" class="text-sm text-red-500">
                  {{ errors.contactEmail }}
                </p>
              </div>
            </div>
          </Card>

          <!-- 人力需求專屬欄位 -->
          <Card
            v-if="isHumanType"
            class="p-4 space-y-3 bg-blue-50 border-blue-200"
          >
            <Label class="flex items-center gap-2 font-semibold">
              <UserIcon class="w-4 h-4" />
              人力需求資訊
            </Label>
            <div class="space-y-2">
              <Label for="humanRequired" class="flex items-center gap-2">
                <HashIcon class="w-4 h-4" />
                所需人數 <span class="text-red-500">*</span>
              </Label>
              <Input
                id="humanRequired"
                v-model="formData.humanNeed.required"
                type="number"
                min="1"
                placeholder="例：10"
                :class="{ 'border-red-500': errors.humanRequired }"
              />
              <p v-if="errors.humanRequired" class="text-sm text-red-500">
                {{ errors.humanRequired }}
              </p>
            </div>
            <div class="space-y-2">
              <Label for="riskNotes" class="flex items-center gap-2">
                <AlertTriangleIcon class="w-4 h-4 text-orange-500" />
                風險注意事項
              </Label>
              <Textarea
                id="riskNotes"
                v-model="formData.humanNeed.riskNotes"
                placeholder="請說明工作風險與注意事項，例：需穿雨鞋、注意泥濘滑倒"
                :rows="3"
              />
            </div>
          </Card>

          <!-- 物資需求專屬欄位 -->
          <Card
            v-if="isSupplyType"
            class="p-4 space-y-3 bg-green-50 border-green-200"
          >
            <div class="flex items-center justify-between">
              <Label class="flex items-center gap-2 font-semibold">
                <PackageIcon class="w-4 h-4" />
                物資需求清單
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                @click="addSupplyItem"
              >
                <PlusIcon class="w-4 h-4 mr-1" />
                新增物資
              </Button>
            </div>

            <div
              v-for="(item, index) in formData.supplyItems"
              :key="index"
              class="p-3 bg-white rounded-lg border space-y-2"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium"
                  >物資項目 {{ index + 1 }}</span
                >
                <Button
                  v-if="formData.supplyItems.length > 1"
                  type="button"
                  size="sm"
                  variant="ghost"
                  @click="removeSupplyItem(index)"
                >
                  <TrashIcon class="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div class="space-y-2">
                <Input
                  v-model="item.itemName"
                  placeholder="物資名稱 *"
                  :class="{
                    'border-red-500': errors[`supplyItem${index}Name`],
                  }"
                />
                <p
                  v-if="errors[`supplyItem${index}Name`]"
                  class="text-sm text-red-500"
                >
                  {{ errors[`supplyItem${index}Name`] }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="space-y-2">
                  <Input
                    v-model="item.quantity"
                    type="number"
                    min="1"
                    placeholder="數量 *"
                    :class="{
                      'border-red-500': errors[`supplyItem${index}Quantity`],
                    }"
                  />
                  <p
                    v-if="errors[`supplyItem${index}Quantity`]"
                    class="text-sm text-red-500"
                  >
                    {{ errors[`supplyItem${index}Quantity`] }}
                  </p>
                </div>
                <div class="space-y-2">
                  <Input
                    v-model="item.unit"
                    placeholder="單位 *"
                    :class="{
                      'border-red-500': errors[`supplyItem${index}Unit`],
                    }"
                  />
                  <p
                    v-if="errors[`supplyItem${index}Unit`]"
                    class="text-sm text-red-500"
                  >
                    {{ errors[`supplyItem${index}Unit`] }}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <!-- 詳細說明 -->
          <div class="space-y-2">
            <Label for="description">詳細說明</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="請詳細說明需求內容、工作內容、注意事項等"
              :rows="4"
            />
            <p class="text-xs text-gray-500">
              選填，但建議提供詳細資訊以便志工或捐贈者了解
            </p>
          </div>

          <!-- 提示訊息 -->
          <Card class="p-4 bg-yellow-50 border-yellow-200 mb-4">
            <p class="text-sm text-gray-700">⏱️ 審核時間最長 30 分鐘。</p>
          </Card>
        </form>
      </ScrollArea>

      <DialogFooter class="px-6 pb-6 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          @click="emit('update:open', false)"
          :disabled="isSubmitting"
        >
          取消
        </Button>
        <Button type="submit" :disabled="isSubmitting" @click="handleSubmit">
          {{
            isSubmitting ? "提交中..." : initialData ? "儲存變更" : "提交需求"
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Map Picker Modal -->
  <MapPicker
    v-model:open="showMapPicker"
    :initial-location="formData.location"
    @select="handleLocationSelect"
  />
</template>
