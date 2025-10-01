<script setup>
import { computed, ref } from "vue";
import { useMapStore } from "../../stores/map";
import { useToastStore } from "../../stores/toast";
import {
  XIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  Share2Icon,
  CopyIcon,
  CheckIcon,
} from "lucide-vue-next";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import VolunteerForm from "@/components/Forms/VolunteerForm.vue";
import DonationForm from "@/components/Forms/DonationForm.vue";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

defineEmits(["close"]);

const mapStore = useMapStore();
const toastStore = useToastStore();
const selectedDemand = computed(() => mapStore.selectedDemand);
const isOpen = computed({
  get: () => mapStore.isPanelOpen,
  set: (value) => {
    if (!value) {
      mapStore.closePanel();
    }
  },
});

const copiedField = ref(null);
const showVolunteerForm = ref(false);
const showDonationForm = ref(false);

const typeLabels = {
  human: "人力任務",
  supply: "物資需求",
  "site-holding": "污泥暫置場",
  "site-parking": "物資停放處",
  "site-stay": "住宿地點",
  "site-food": "領吃食區域",
};

function getTypeLabel(type) {
  return typeLabels[type] || type;
}

function handleShare() {
  // TODO: Implement share functionality
  console.log("Share clicked");
}

function handleClose() {
  mapStore.closePanel();
}

async function copyToClipboard(text, fieldName) {
  try {
    await navigator.clipboard.writeText(text);
    copiedField.value = fieldName;
    setTimeout(() => {
      copiedField.value = null;
    }, 2000);
  } catch (err) {
    console.error("複製失敗:", err);
  }
}

// 對齊 SRS：處理志工報名提交（plan.md 12）
async function handleVolunteerSubmit(data) {
  try {
    // 寫入 Firestore volunteerApplications 集合
    await addDoc(collection(db, "volunteerApplications"), data);

    toastStore.success("報名成功！管理員將在 2 小時內審核您的申請。");
    showVolunteerForm.value = false;
  } catch (err) {
    console.error("提交失敗:", err);
    toastStore.error("提交失敗，請稍後再試");
  }
}

// 對齊 SRS：處理物資捐贈提交（plan.md 12）
async function handleDonationSubmit(data) {
  try {
    // 寫入 Firestore donations 集合
    await addDoc(collection(db, "donations"), data);

    toastStore.success("捐贈登記成功！管理員將在 2 小時內審核您的捐贈。");
    showDonationForm.value = false;
  } catch (err) {
    console.error("提交失敗:", err);
    toastStore.error("提交失敗，請稍後再試");
  }
}
</script>

<template>
  <Drawer v-model:open="isOpen" direction="right" :modal="false">
    <DrawerContent class="overflow-hidden">
      <template v-if="selectedDemand">
        <!-- Header with Badge and Actions -->
        <DrawerHeader class="border-b">
          <DrawerTitle class="flex items-center gap-2 justify-between">
            <div class="flex items-center gap-2">
              {{ getTypeLabel(selectedDemand.type) }}
            </div>
            <div class="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                @click="handleShare"
                aria-label="分享"
              >
                <Share2Icon class="w-5 h-5" />
              </Button>
              <DrawerClose>
                <Button variant="ghost" size="icon" aria-label="關閉">
                  <XIcon class="w-5 h-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerTitle>
          <DrawerDescription class="hidden">
            查看需求的詳細資訊，包括地點、聯絡方式和需求內容
          </DrawerDescription>
        </DrawerHeader>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Supply Items List -->
          <Card
            v-if="
              selectedDemand.type === 'supply' && selectedDemand.supplyItems
            "
            class="p-4 [&_*]:select-text [&_span]:cursor-text [&_p]:cursor-text"
            @pointerdown.stop
          >
            <div class="flex items-center justify-between mb-3">
              <Label class="text-sm font-medium">物資需求清單</Label>
              <span class="text-xs text-gray-500">
                已登記：{{ selectedDemand.donationCount || 0 }} 筆
              </span>
            </div>
            <div class="space-y-2">
              <div
                v-for="(item, index) in (selectedDemand.remainingSupplyItems || selectedDemand.supplyItems)"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span class="text-sm text-gray-900 font-medium">{{
                  item.itemName
                }}</span>
                <span class="text-sm font-semibold text-gray-700">
                  {{ item.quantity }} {{ item.unit }}
                </span>
              </div>
            </div>
          </Card>

          <!-- Location -->
          <Card
            class="p-4 [&_*]:select-text [&_p]:cursor-text"
            @pointerdown.stop
          >
            <div class="flex items-start gap-3">
              <MapPinIcon class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <Label class="text-sm font-medium">集合地點</Label>
                  <Button
                    v-if="selectedDemand.location?.address"
                    variant="ghost"
                    size="icon"
                    class="h-6 w-6"
                    @click="
                      copyToClipboard(
                        selectedDemand.location.address,
                        'location',
                      )
                    "
                    aria-label="複製地點"
                  >
                    <CheckIcon
                      v-if="copiedField === 'location'"
                      class="w-4 h-4 text-green-600"
                    />
                    <CopyIcon v-else class="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
                <p class="text-sm text-gray-600">
                  {{ selectedDemand.location?.address || "未提供" }}
                </p>
              </div>
            </div>
          </Card>

          <!-- Contact -->
          <Card
            v-if="selectedDemand.contact"
            class="p-4 [&_*]:select-text [&_p]:cursor-text"
            @pointerdown.stop
          >
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <UserIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <Label class="text-sm font-medium">聯絡人</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6"
                      @click="
                        copyToClipboard(selectedDemand.contact.name, 'name')
                      "
                      aria-label="複製聯絡人"
                    >
                      <CheckIcon
                        v-if="copiedField === 'name'"
                        class="w-4 h-4 text-green-600"
                      />
                      <CopyIcon v-else class="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                  <p class="text-sm text-gray-600">
                    {{ selectedDemand.contact.name }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <PhoneIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <Label class="text-sm font-medium">聯絡電話</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6"
                      @click="
                        copyToClipboard(selectedDemand.contact.phone, 'phone')
                      "
                      aria-label="複製電話"
                    >
                      <CheckIcon
                        v-if="copiedField === 'phone'"
                        class="w-4 h-4 text-green-600"
                      />
                      <CopyIcon v-else class="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                  <p class="text-sm text-gray-600">
                    {{ selectedDemand.contact.phone }}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <!-- Description -->
          <Card
            v-if="selectedDemand.description"
            class="p-4 [&_*]:select-text [&_p]:cursor-text"
            @pointerdown.stop
          >
            <Label class="text-sm font-medium mb-2 block">詳細說明</Label>
            <p class="text-sm text-gray-600 whitespace-pre-wrap">
              {{ selectedDemand.description }}
            </p>
          </Card>

          <!-- Human Need Info -->
          <Card
            v-if="selectedDemand.type === 'human' && selectedDemand.humanNeed"
            class="p-4 [&_*]:select-text [&_p]:cursor-text"
            @pointerdown.stop
          >
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <Label class="text-sm font-medium mb-1 block">已報名</Label>
                  <p class="text-sm text-gray-900 font-semibold">
                    {{ selectedDemand.appliedCount || 0 }} 人
                  </p>
                </div>
                <div>
                  <Label class="text-sm font-medium mb-1 block">需求</Label>
                  <p class="text-sm text-gray-600">
                    {{ selectedDemand.humanNeed.required }} 人
                  </p>
                </div>
                <div>
                  <Label class="text-sm font-medium mb-1 block">尚缺</Label>
                  <p class="text-sm text-gray-900 font-semibold">
                    {{ Math.max(0, (selectedDemand.humanNeed.required || 0) - (selectedDemand.appliedCount || 0)) }} 人
                  </p>
                </div>
              </div>
              <div
                v-if="selectedDemand.humanNeed.riskNotes"
                class="p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <Label class="text-sm font-medium text-red-600 mb-1 block"
                  >⚠️ 風險注意事項</Label
                >
                <p class="text-sm text-red-600">
                  {{ selectedDemand.humanNeed.riskNotes }}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Action Buttons (Footer) -->
        <DrawerFooter class="border-t pt-4">
          <Button
            v-if="selectedDemand.type === 'human'"
            class="w-full"
            size="lg"
            @click="showVolunteerForm = true"
          >
            我要報名志工
          </Button>
          <Button
            v-if="selectedDemand.type === 'supply'"
            class="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            @click="showDonationForm = true"
          >
            我要捐贈物資
          </Button>
        </DrawerFooter>
      </template>
    </DrawerContent>
  </Drawer>

  <!-- Volunteer Application Form Modal -->
  <VolunteerForm
    v-model:open="showVolunteerForm"
    :demand-id="selectedDemand?.id"
    :demand-title="selectedDemand?.title"
    @submit="handleVolunteerSubmit"
  />

  <!-- Donation Form Modal -->
  <DonationForm
    v-model:open="showDonationForm"
    :demand-id="selectedDemand?.id"
    :demand-title="selectedDemand?.title"
    :supply-items="selectedDemand?.supplyItems"
    @submit="handleDonationSubmit"
  />
</template>
