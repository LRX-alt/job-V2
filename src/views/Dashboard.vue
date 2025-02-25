<template>
  <div class="dashboard">
    <div class="container">
      <!-- Pulsante per aggiungere un nuovo ordine -->
      <button class="open-modal-btn" @click="showAddOrderModal = true">
        ➕ Aggiungi Nuovo Ordine
      </button>
      <ModalAddOrder
        v-if="showAddOrderModal"
        @close="showAddOrderModal = false"
        @order-added="handleOrderAdded"
      />

      <h2>Gestione Ordini</h2>

      <!-- Sezione Filtri -->
      <div class="filters">
        <div class="filter-item">
          <label for="filtroData">Data:</label>
          <input
            id="filtroData"
            v-model="filtroData"
            type="date"
            placeholder="gg/mm/aaaa"
          />
        </div>
        <div class="filter-item">
          <label for="filtroJob">Job ID:</label>
          <input
            id="filtroJob"
            v-model="filtroJob"
            type="number"
            placeholder="Inserisci Job ID"
          />
        </div>
        <div class="filter-item">
          <label for="filtroLavorazione">Lavorazione:</label>
          <select id="filtroLavorazione" v-model="filtroLavorazione">
            <option value="">Tutte le lavorazioni</option>
            <option value="Taglio">Taglio</option>
            <option value="Piegatura">Piegatura</option>
            <option value="Taglio + Piegatura">Taglio + Piegatura</option>
            <option value="Satinatura">Satinatura</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filtroTurno">Turno:</label>
          <select id="filtroTurno" v-model="filtroTurno">
            <option value="">Tutti i turni</option>
            <option value="Mattina">Mattina</option>
            <option value="Pomeriggio">Pomeriggio</option>
            <option value="Notte">Notte</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filtroStato">Stato:</label>
          <select id="filtroStato" v-model="filtroStato">
            <option value="">Tutti gli stati</option>
            <option value="In attesa">In attesa</option>
            <option value="In lavorazione">In lavorazione</option>
            <option value="Lavorato">Lavorato</option>
          </select>
        </div>
      </div>

      <!-- Lista Ordini -->
      <div class="order-list">
        <div v-for="order in ordersFiltered" :key="order.id" class="order-card">
          <p><strong>Cliente:</strong> {{ order.cliente }}</p>
          <p><strong>Materiale:</strong> {{ order.materiale }}</p>
          <p><strong>Lavorazione:</strong> {{ order.lavorazione }}</p>
          <p><strong>Data:</strong> {{ formattaData(order.data) }}</p>
          <p><strong>Job ID:</strong> {{ order.jobId }}</p>
          <p><strong>Numero Ordine:</strong> {{ order.numeroOrdine }}</p>
          <!-- Stato con pallina colorata e menu a tendina -->
          <p>
            <strong>Stato:</strong>
            <span :class="getStatoClass(order.stato)" class="status-dot"></span>
            <select v-model="order.stato" @change="updateOrder(order)">
              <option value="In attesa">In attesa</option>
              <option value="In lavorazione">In lavorazione</option>
              <option value="Lavorato">Lavorato</option>
            </select>
          </p>
          <p><strong>Turno:</strong> {{ order.turno }}</p>

          <!-- Sezione Azioni -->
          <div class="actions">
            <button class="edit-btn" @click="openEditOrderModal(order)">
              ✏️ Modifica Ordine
            </button>
            <button class="delete-btn" @click="deleteOrder(order)">
              🗑 Elimina Ordine
            </button>
            <button
              v-if="order.stato === 'Lavorato'"
              class="archive-btn"
              @click="archiveOrder(order)"
            >
              📂 Archivia Ordine
            </button>
          </div>

          <!-- Sezione Note -->
          <div class="note-section">
            <button class="note-btn" @click="openNoteModal(order)">
              📝 Aggiungi/Modifica Nota
            </button>
            <p v-if="order.nota"><strong>Nota:</strong> {{ order.nota }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modale per le Note -->
    <div v-if="showNoteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Aggiungi/Modifica Nota</h3>
        <textarea v-model="currentNote" placeholder="Scrivi qui la tua nota..."></textarea>
        <div class="modal-buttons">
          <button @click="saveNote">Salva</button>
          <button @click="closeNoteModal">Annulla</button>
        </div>
      </div>
    </div>

    <!-- Modale per la Modifica dell'Ordine -->
    <div v-if="showEditOrderModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Modifica Ordine</h3>
        <div class="edit-form">
          <label>Cliente:</label>
          <input v-model="editedOrder.cliente" type="text" />
          <label>Materiale:</label>
          <input v-model="editedOrder.materiale" type="text" />
          <label>Lavorazione:</label>
          <select v-model="editedOrder.lavorazione">
            <option value="Taglio">Taglio</option>
            <option value="Piegatura">Piegatura</option>
            <option value="Taglio + Piegatura">Taglio + Piegatura</option>
            <option value="Satinatura">Satinatura</option>
          </select>
          <label>Data:</label>
          <input v-model="editedOrder.data" type="date" />
          <label>Job ID:</label>
          <input v-model="editedOrder.jobId" type="number" />
          <label>Numero Ordine:</label>
          <input v-model="editedOrder.numeroOrdine" type="number" />
          <label>Turno:</label>
          <select v-model="editedOrder.turno">
            <option value="Mattina">Mattina</option>
            <option value="Pomeriggio">Pomeriggio</option>
            <option value="Notte">Notte</option>
          </select>
          <label>Stato:</label>
          <select v-model="editedOrder.stato">
            <option value="In attesa">In attesa</option>
            <option value="In lavorazione">In lavorazione</option>
            <option value="Lavorato">Lavorato</option>
          </select>
        </div>
        <div class="modal-buttons">
          <button @click="saveOrderEdits">Salva</button>
          <button @click="closeEditOrderModal">Annulla</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed } from "vue";
import ModalAddOrder from "@/components/ModalAddOrder.vue";
import { db } from "@/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

export default {
  components: { ModalAddOrder },
  setup() {
    const orders = ref([]);
    const showAddOrderModal = ref(false);

    // Filtri
    const filtroData = ref("");
    const filtroCliente = ref("");
    const filtroLavorazione = ref("");
    const filtroTurno = ref("");
    const filtroStato = ref("");

    // Modale per le note
    const showNoteModal = ref(false);
    const currentNote = ref("");
    const selectedOrder = ref(null);

    // Modale per la modifica dell'ordine
    const showEditOrderModal = ref(false);
    const editedOrder = ref({});

    // Recupero ordini da Firestore (solo quelli non archiviati)
    onSnapshot(collection(db, "orders"), (snapshot) => {
      orders.value = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((order) => !order.archiviato);
    });

    // Computed: Filtra gli ordini in base a tutti i filtri
    const ordersFiltered = computed(() => {
      return orders.value.filter((order) => {
        const matchData = !filtroData.value || order.data === filtroData.value;
        const matchCliente =
          !filtroCliente.value ||
          order.cliente.toLowerCase().includes(filtroCliente.value.toLowerCase());
        const matchLav =
          !filtroLavorazione.value || order.lavorazione === filtroLavorazione.value;
        const matchTurno = !filtroTurno.value || order.turno === filtroTurno.value;
        const matchStato = !filtroStato.value || order.stato === filtroStato.value;
        return matchData && matchCliente && matchLav && matchTurno && matchStato;
      });
    });

    // Funzione per formattare la data da "YYYY-MM-DD" a "DD/MM/YYYY"
    const formattaData = (dataStr) => {
      if (!dataStr) return "";
      const parts = dataStr.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    // Aggiorna lo stato dell'ordine (aggiornamento solo, senza archiviazione automatica)
    const updateOrder = async (order) => {
      const orderRef = doc(db, "orders", order.id);
      try {
        await updateDoc(orderRef, { stato: order.stato });
      } catch (error) {
        console.error("Errore nell'aggiornamento dello stato:", error);
      }
    };

    // Archivia manualmente l'ordine (pulsante visibile solo se lo stato è "Lavorato")
    const archiveOrder = async (order) => {
      const orderRef = doc(db, "orders", order.id);
      try {
        await updateDoc(orderRef, { archiviato: true });
      } catch (error) {
        console.error("Errore nell'archiviazione:", error);
      }
    };

    // Funzione per ottenere la classe per la pallina dello stato
    const getStatoClass = (stato) => {
      switch (stato) {
        case "In attesa":
          return "status-red";
        case "In lavorazione":
          return "status-yellow";
        case "Lavorato":
          return "status-green";
        default:
          return "";
      }
    };

    // Funzioni per il modale delle note
    const openNoteModal = (order) => {
      selectedOrder.value = order;
      currentNote.value = order.nota || "";
      showNoteModal.value = true;
    };

    const closeNoteModal = () => {
      showNoteModal.value = false;
      selectedOrder.value = null;
      currentNote.value = "";
    };

    const saveNote = async () => {
      if (selectedOrder.value) {
        const orderRef = doc(db, "orders", selectedOrder.value.id);
        try {
          await updateDoc(orderRef, { nota: currentNote.value });
          selectedOrder.value.nota = currentNote.value;
          closeNoteModal();
        } catch (error) {
          console.error("Errore nel salvataggio della nota:", error);
        }
      }
    };

    // Funzioni per la modifica dell'ordine
    const openEditOrderModal = (order) => {
      editedOrder.value = { ...order };
      showEditOrderModal.value = true;
    };

    const closeEditOrderModal = () => {
      showEditOrderModal.value = false;
      editedOrder.value = {};
    };

    const saveOrderEdits = async () => {
      if (editedOrder.value.id) {
        const orderRef = doc(db, "orders", editedOrder.value.id);
        try {
          await updateDoc(orderRef, { ...editedOrder.value });
          closeEditOrderModal();
        } catch (error) {
          console.error("Errore nel salvataggio delle modifiche:", error);
        }
      }
    };

    // Funzione per eliminare l'ordine
    const deleteOrder = async (order) => {
      if (confirm(`Sei sicuro di voler eliminare l'ordine di ${order.cliente}?`)) {
        try {
          const orderRef = doc(db, "orders", order.id);
          await deleteDoc(orderRef);
        } catch (error) {
          console.error("Errore nell'eliminazione dell'ordine:", error);
        }
      }
    };

    // Gestione dell'aggiunta di un nuovo ordine dal modale
    const handleOrderAdded = async (orderData) => {
      try {
        await addDoc(collection(db, "orders"), { ...orderData, archiviato: false });
        showAddOrderModal.value = false;
      } catch (error) {
        console.error("Errore nell'aggiunta dell'ordine:", error);
      }
    };

    return {
      orders,
      showAddOrderModal,
      filtroData,
      filtroCliente,
      filtroLavorazione,
      filtroTurno,
      filtroStato,
      ordersFiltered,
      formattaData,
      updateOrder,
      archiveOrder,
      getStatoClass,
      showNoteModal,
      currentNote,
      selectedOrder,
      openNoteModal,
      closeNoteModal,
      saveNote,
      showEditOrderModal,
      editedOrder,
      openEditOrderModal,
      closeEditOrderModal,
      saveOrderEdits,
      deleteOrder,
      handleOrderAdded,
    };
  },
};
</script>

<style scoped>
/* Palline per lo stato */
.status-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}
.status-red {
  background: red;
}
.status-yellow {
  background: yellow;
}
.status-green {
  background: green;
}

/* Pulsante "Aggiungi Nuovo Ordine" */
.open-modal-btn {
  display: block;
  margin: 0 auto 20px;
  padding: 10px 20px;
  font-size: 18px;
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.open-modal-btn:hover {
  background: #218838;
}

/* Layout Container */
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Sezione Ordini */
.order-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}
.order-section h2 {
  text-align: center;
  margin-bottom: 20px;
}

/* Filtri */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}
.filter-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}
.filter-item label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.filter-item input,
.filter-item select {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 180px;
}
/* Forza il campo date a non avere icona (override per dispositivi mobile) */
.filter-item input[type="date"] {
  background-image: none;
}

/* Lista Ordini */
.order-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}
.order-card {
  background-color: #444;
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  width: 300px;
}
.order-card p {
  margin: 5px 0;
}

/* Sezione Azioni */
.actions {
  display: flex;
  gap: 5px;
  margin-top: 10px;
  justify-content: space-between;
}
.edit-btn,
.delete-btn,
.archive-btn {
  padding: 6px 10px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.edit-btn {
  background: #ffc107;
  color: #000;
}
.edit-btn:hover {
  background: #e0a800;
}
.delete-btn {
  background: #dc3545;
  color: #fff;
}
.delete-btn:hover {
  background: #c82333;
}
.archive-btn {
  background: #007bff;
  color: #fff;
}
.archive-btn:hover {
  background: #0056b3;
}

/* Sezione Note */
.note-section {
  margin-top: 10px;
}
.note-btn {
  background: #007bff;
  color: #fff;
  padding: 6px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.note-btn:hover {
  background: #0056b3;
}

/* Modale per le Note */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: #fff;
  width: 300px;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}
.modal-content h3 {
  margin-bottom: 10px;
}
.modal-content textarea {
  width: 100%;
  height: 120px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px;
  resize: none;
}
.modal-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
}
.modal-buttons button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.modal-buttons button:first-child {
  background: #28a745;
  color: #fff;
}
.modal-buttons button:last-child {
  background: #dc3545;
  color: #fff;
}
.modal-buttons button:hover:first-child {
  background: #218838;
}
.modal-buttons button:hover:last-child {
  background: #c82333;
}

/* Modale per la Modifica dell'Ordine */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}
.edit-form label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.edit-form input,
.edit-form select {
  padding: 6px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
}
</style>
