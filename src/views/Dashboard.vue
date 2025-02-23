<template>
  <div class="dashboard">
    <div class="container">
      <button class="open-modal-btn" @click="showModal = true">
        ➕ Aggiungi Nuovo Ordine
      </button>

      <ModalAddOrder
        v-if="showModal"
        @close="showModal = false"
        @order-added="handleOrderAdded"
      />

      <div class="order-section">
        <h2>Gestione Ordini</h2>

        <div class="filters">
          <label>Data: <input v-model="filtroData" type="date" /></label>
          <label>Cliente: <input v-model="filtroCliente" type="text" /></label>
          <label>Lavorazione:
            <select v-model="filtroLavorazione">
              <option value="">Tutte</option>
              <option value="Taglio">Taglio</option>
              <option value="Piegatura">Piegatura</option>
              <option value="Taglio + Piegatura">Taglio + Piegatura</option>
              <option value="Satinatura">Satinatura</option>
            </select>
          </label>
        </div>

        <div class="order-list">
          <div v-for="order in ordiniFiltrati" :key="order.id" class="order-card">
            <p><strong>Cliente:</strong> {{ order.cliente }}</p>
            <p><strong>Materiale:</strong> {{ order.materiale }}</p>
            <p><strong>Lavorazione:</strong> {{ order.lavorazione }}</p>
            <p><strong>Data:</strong> {{ formattaData(order.data) }}</p>
            <p><strong>Job ID:</strong> {{ order.jobId }}</p>

            <!-- Menu a tendina per lo stato -->
            <p>
              <strong>Stato:</strong>
              <select v-model="order.stato" @change="aggiornaOrdine(order)">
                <option value="In attesa">In attesa</option>
                <option value="In lavorazione">In lavorazione</option>
                <option value="Lavorato">Lavorato</option>
              </select>
            </p>

            <p><strong>Turno:</strong> {{ order.turno }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import ModalAddOrder from "@/components/ModalAddOrder.vue";
import { db } from "@/firebase";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";

export default {
  components: { ModalAddOrder },
  setup() {
    const ordini = ref([]);
    const filtroData = ref("");
    const filtroCliente = ref("");
    const filtroLavorazione = ref("");

    // Recupero ordini da Firestore
    onSnapshot(collection(db, "orders"), (snapshot) => {
      ordini.value = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order) => !order.archiviato);
    });

    // Filtrare gli ordini
    const ordiniFiltrati = computed(() => {
      return ordini.value.filter((order) => {
        return (
          (!filtroData.value || order.data === filtroData.value) &&
          (!filtroCliente.value || order.cliente.toLowerCase().includes(filtroCliente.value.toLowerCase())) &&
          (!filtroLavorazione.value || order.lavorazione === filtroLavorazione.value)
        );
      });
    });

    // Funzione per aggiornare lo stato dell'ordine e archiviarlo se "Lavorato"
    const aggiornaOrdine = async (order) => {
      const ordineRef = doc(db, "orders", order.id);
      await updateDoc(ordineRef, { stato: order.stato });

      if (order.stato === "Lavorato") {
        await updateDoc(ordineRef, { archiviato: true });
      }
    };

    return {
      ordini,
      filtroData,
      filtroCliente,
      filtroLavorazione,
      ordiniFiltrati,
      aggiornaOrdine
    };
  }
};
</script>
