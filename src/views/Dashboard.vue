<template>
  <div class="dashboard">
    <div class="container">
      <!-- Pulsante per aprire il modale di inserimento ordine -->
      <button class="open-modal-btn" @click="showModal = true">
        ➕ Aggiungi Nuovo Ordine
      </button>

      <!-- Modale per l'inserimento di un nuovo ordine -->
      <ModalAddOrder
        v-if="showModal"
        @close="showModal = false"
        @order-added="handleOrderAdded"
      />

      <h2>Gestione Ordini</h2>

      <!-- Filtri (come prima) -->
      <div class="filters">
        <div class="filter-item">
          <label for="filtroData">Data (gg/mm/aaaa):</label>
          <input id="filtroData" v-model="filtroData" type="date" />
        </div>
        <div class="filter-item">
          <label for="filtroJob">Job ID:</label>
          <input id="filtroJob" v-model="filtroJob" type="number" placeholder="Job ID" />
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

      <!-- Lista Ordini con schede scure e pulsante "Aggiungi/Modifica Nota" -->
      <div class="order-list">
        <div
          v-for="order in ordiniFiltrati"
          :key="order.id"
          class="order-card"
        >
          <p><strong>Cliente:</strong> {{ order.cliente }}</p>
          <p><strong>Materiale:</strong> {{ order.materiale }}</p>
          <p><strong>Lavorazione:</strong> {{ order.lavorazione }}</p>
          <p><strong>Data:</strong> {{ formattaData(order.data) }}</p>
          <p><strong>Job ID:</strong> {{ order.jobId }}</p>
          <p><strong>Numero Ordine:</strong> {{ order.numeroOrdine }}</p>
          <p><strong>Stato:</strong> {{ order.stato }}</p>
          <p><strong>Turno:</strong> {{ order.turno }}</p>

          <!-- Sezione Note -->
          <div class="order-notes">
            <button class="note-btn" @click="apriModaleNota(order)">
              📝 Aggiungi/Modifica Nota
            </button>
            <p v-if="order.nota">
              <strong>Nota:</strong> {{ order.nota }}
            </p>
          </div>
        </div>
      </div>

      <!-- Modale per aggiungere/modificare le note -->
      <div v-if="modaleNota" class="modal-overlay">
        <div class="modal-content">
          <h3>Modifica Nota</h3>
          <textarea v-model="notaCorrente" placeholder="Aggiungi una nota..."></textarea>
          <div class="modal-buttons">
            <button @click="salvaNota">Salva</button>
            <button @click="chiudiModaleNota">Annulla</button>
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
    // Variabili reattive
    const ordini = ref([]);
    const showModal = ref(false);

    // Filtri
    const filtroData = ref("");
    const filtroJob = ref("");
    const filtroLavorazione = ref("");
    const filtroTurno = ref("");
    const filtroStato = ref("");

    // Modale note
    const modaleNota = ref(false);
    const ordineSelezionato = ref(null);
    const notaCorrente = ref("");

    // Recupero ordini in tempo reale
    onSnapshot(collection(db, "orders"), (snapshot) => {
      ordini.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });

    // Computed: filtra gli ordini
    const ordiniFiltrati = computed(() => {
      return ordini.value.filter((order) => {
        // Filtro data (esatto match su "YYYY-MM-DD")
        const matchData = !filtroData.value || order.data === filtroData.value;

        // Filtro job (inclusione parziale)
        const matchJob = !filtroJob.value || (order.jobId && order.jobId.toString().includes(filtroJob.value));

        // Filtro lavorazione
        const matchLavorazione = !filtroLavorazione.value || order.lavorazione === filtroLavorazione.value;

        // Filtro turno
        const matchTurno = !filtroTurno.value || order.turno === filtroTurno.value;

        // Filtro stato
        const matchStato = !filtroStato.value || order.stato === filtroStato.value;

        return matchData && matchJob && matchLavorazione && matchTurno && matchStato;
      });
    });

    // Formatta la data da "YYYY-MM-DD" a "DD/MM/YYYY"
    const formattaData = (dataStr) => {
      if (!dataStr) return "";
      const parti = dataStr.split("-");
      return `${parti[2]}/${parti[1]}/${parti[0]}`;
    };

    // Apertura modale per inserire/modificare nota
    const apriModaleNota = (order) => {
      ordineSelezionato.value = order;
      notaCorrente.value = order.nota || "";
      modaleNota.value = true;
    };

    // Chiusura modale note
    const chiudiModaleNota = () => {
      modaleNota.value = false;
      ordineSelezionato.value = null;
      notaCorrente.value = "";
    };

    // Salvataggio della nota su Firestore
    const salvaNota = async () => {
      if (ordineSelezionato.value) {
        const ordineRef = doc(db, "orders", ordineSelezionato.value.id);
        await updateDoc(ordineRef, { nota: notaCorrente.value });
        ordineSelezionato.value.nota = notaCorrente.value;
        chiudiModaleNota();
      }
    };

    // Quando un ordine viene aggiunto dal modale
    const handleOrderAdded = () => {
      showModal.value = false;
    };

    return {
      ordini,
      showModal,
      filtroData,
      filtroJob,
      filtroLavorazione,
      filtroTurno,
      filtroStato,
      ordiniFiltrati,
      modaleNota,
      notaCorrente,
      ordineSelezionato,

      formattaData,
      apriModaleNota,
      chiudiModaleNota,
      salvaNota,
      handleOrderAdded,
    };
  },
};
</script>

<style scoped>
.dashboard {
  background-color: #f4f5f7;
  padding: 20px;
  min-height: 100vh;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Pulsante "Aggiungi Nuovo Ordine" (verde, centrato) */
.open-modal-btn {
  display: block;
  margin: 0 auto 10px;
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
  margin-bottom: 20px;
  justify-content: center;
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

/* Lista ordini */
.order-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
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

/* Pulsante note */
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

/* Modale note */
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
</style>
