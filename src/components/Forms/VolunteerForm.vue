<script setup>
// 對齊 SRS：志工報名表單（plan.md 7.2）
// 欄位：姓名、電話、可服務時間、專業技能、攜帶工具、備註
// 使用 Pinia + persist 取代 localStorage
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UserIcon,
  PhoneIcon,
  ClockIcon,
  WrenchIcon,
  BriefcaseIcon,
} from "lucide-vue-next";
import { useVolunteerFormStore } from "@/stores/forms";
import { useToastStore } from "@/stores/toast";
import { createVolunteerApplication } from "@/services";
import { useMapStore } from "@/stores/map";

const props = defineProps({
  open: Boolean,
  demandId: String,
  demandTitle: String,
});

const emit = defineEmits(["update:open", "submit"]);

const formStore = useVolunteerFormStore();
const toastStore = useToastStore();
const mapStore = useMapStore();

// 使用 computed 來雙向綁定 Pinia store
const formData = computed(() => formStore.formData);

const isSubmitting = ref(false);
const errors = ref({});

// 驗證表單
function validateForm() {
  errors.value = {};

  if (!formData.value.name.trim()) {
    errors.value.name = "請輸入姓名";
  }

  if (!formData.value.phone.trim()) {
    errors.value.phone = "請輸入電話";
  } else if (!/^[0-9-+\s()]+$/.test(formData.value.phone)) {
    errors.value.phone = "請輸入有效的電話號碼";
  }

  if (!formData.value.availableTime.trim()) {
    errors.value.availableTime = "請輸入可服務時間";
  }

  return Object.keys(errors.value).length === 0;
}

// 提交表單
async function handleSubmit() {
  if (!validateForm()) {
    toastStore.error("請檢查表單內容");
    return;
  }

  if (!props.demandId) {
    toastStore.error("缺少需求 ID");
    return;
  }

  isSubmitting.value = true;

  try {
    // 對齊 SRS：將技能和工具轉為陣列
    const submitData = {
      demandId: props.demandId,
      applicant: {
        name: formData.value.name.trim(),
        phone: formData.value.phone.trim(),
      },
      availableTime: formData.value.availableTime.trim(),
      skills: formData.value.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      tools: formData.value.tools
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      note: formData.value.note?.trim() || "",
    };

    // 呼叫 Firestore 服務建立志工報名（立即顯示）
    const applicationId = await createVolunteerApplication(submitData);

    toastStore.success("報名成功！已公開顯示。");
    console.log("志工報名已建立，ID:", applicationId);

    // 提交成功後清除表單
    formStore.reset();

    // 立即刷新地圖上的已報名統計
    mapStore.refreshAppliedCounts?.();
    emit("update:open", false);
  } catch (err) {
    console.error("提交失敗:", err);
    toastStore.error("提交失敗，請稍後再試");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent
      class="sm:max-w-[500px] h-[85vh] flex flex-col p-0"
    >
      <DialogHeader class="px-6 pt-6 pb-4 border-b">
        <DialogTitle>我要報名志工</DialogTitle>
        <DialogDescription>
          {{ demandTitle || "填寫以下資料以報名參與志工服務" }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 px-6">
        <form @submit.prevent="handleSubmit" class="space-y-4 py-4 px-1">
          <!-- 姓名和電話（同一行） -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name" class="flex items-center gap-2">
                <UserIcon class="w-4 h-4" />
                姓名 <span class="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                :model-value="formData.name"
                @update:model-value="formStore.updateField('name', $event)"
                placeholder="請輸入您的姓名"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-sm text-red-500">
                {{ errors.name }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="phone" class="flex items-center gap-2">
                <PhoneIcon class="w-4 h-4" />
                電話 <span class="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                :model-value="formData.phone"
                @update:model-value="formStore.updateField('phone', $event)"
                type="tel"
                placeholder="請輸入聯絡電話"
                :class="{ 'border-red-500': errors.phone }"
              />
              <p v-if="errors.phone" class="text-sm text-red-500">
                {{ errors.phone }}
              </p>
              <p class="text-xs text-gray-500">
                您所提供的聯絡資訊將公開顯示於相關頁面，以便彼此聯繫。請自行評估是否提供。
              </p>
            </div>
          </div>

          <!-- 可服務時間 -->
          <div class="space-y-2">
            <Label for="availableTime" class="flex items-center gap-2">
              <ClockIcon class="w-4 h-4" />
              可服務時間 <span class="text-red-500">*</span>
            </Label>
            <Input
              id="availableTime"
              :model-value="formData.availableTime"
              @update:model-value="
                formStore.updateField('availableTime', $event)
              "
              placeholder="例：2025/10/01 10:00 - 12:00"
              :class="{ 'border-red-500': errors.availableTime }"
            />
            <p v-if="errors.availableTime" class="text-sm text-red-500">
              {{ errors.availableTime }}
            </p>
          </div>

          <!-- 專業技能 -->
          <div class="space-y-2">
            <Label for="skills" class="flex items-center gap-2">
              <BriefcaseIcon class="w-4 h-4" />
              專業技能
            </Label>
            <Input
              id="skills"
              :model-value="formData.skills"
              @update:model-value="formStore.updateField('skills', $event)"
              placeholder="用逗號分隔，例：重機械操作, 電工, 水電"
            />
            <p class="text-xs text-gray-500">請以逗號分隔多個技能</p>
          </div>

          <!-- 攜帶工具 -->
          <div class="space-y-2">
            <Label for="tools" class="flex items-center gap-2">
              <WrenchIcon class="w-4 h-4" />
              攜帶工具
            </Label>
            <Input
              id="tools"
              :model-value="formData.tools"
              @update:model-value="formStore.updateField('tools', $event)"
              placeholder="用逗號分隔，例：鏟子, 雨鞋, 水桶"
            />
            <p class="text-xs text-gray-500">請以逗號分隔多個工具</p>
          </div>

          <!-- 備註 -->
          <div class="space-y-2 mb-4">
            <Label for="note">備註</Label>
            <Textarea
              id="note"
              :model-value="formData.note"
              @update:model-value="formStore.updateField('note', $event)"
              placeholder="其他補充說明"
              :rows="3"
            />
          </div>
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
          {{ isSubmitting ? "提交中..." : "確認報名" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
