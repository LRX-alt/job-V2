<template>
  <div class="archivio-container">
    <h1>Archivio Ordini</h1>

    <!-- Filtri (simili alla dashboard) -->
    <div class="filters">
      <div class="filter-item">
        <label for="filtroData">Data:</label>
        <input
          id="filtroData"
          v-model="filtroData"
          type="date"
          placeholder="YYYY-MM-DD"
        />
      </div>

      <div class="filter-item">
        <label for="filtroCliente">Cliente:</label>
        <input
          id="filtroCliente"
          v-model="filtroCliente"
          type="text"
          placeholder="Inserisci Cliente"
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

      <button @click="resetFiltri" class="reset-btn">
        Reset Filtri
      </button>
    </div>

    <!-- Pulsanti per esportare gli ordini -->
    <div class="export-btns">
      <button @click="exportCSV" class="export-btn">Esporta in CSV</button>
      <button @click="exportExcel" class="export-btn">Esporta in Excel</button>
    </div>

    <!-- Tabella con gli ordini archiviati -->
    <div v-if="filteredOrders.length">
      <table class="order-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Materiale</th>
            <th>Lavorazione</th>
            <th>Data</th>
            <th>Job ID</th>
            <th>Numero Ordine</th>
            <th>Stato</th>
            <th>Turno</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>{{ order.cliente }}</td>
            <td>{{ order.materiale }}</td>
            <td>{{ order.lavorazione }}</td>
            <td>{{ formatDate(order.data) }}</td>
            <td>{{ order.jobId }}</td>
            <td>{{ order.numeroOrdine }}</td>
            <td>{{ order.stato }}</td>
            <td>{{ order.turno }}</td>
            <td>
              <button @click="deleteOrder(order)" class="delete-btn">
                Elimina
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>
      Nessun ordine archiviato corrispondente ai filtri.
    </p>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { db } from "@/firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import * as XLSX from "xlsx";

export default {
  setup() {
    // Array di tutti gli ordini archiviati
    const orders = ref([]);

    // Filtri
    const filtroData = ref("");
    const filtroCliente = ref("");
    const filtroLavorazione = ref("");
    const filtroTurno = ref("");
    const filtroStato = ref("");

    // Al montaggio del componente, recupera gli ordini archiviati
    onMounted(() => {
      onSnapshot(collection(db, "orders"), (snapshot) => {
        orders.value = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((order) => order.archiviato === true);
      });
    });

    // Computed: filtra gli ordini in base ai filtri
    const filteredOrders = computed(() => {
      return orders.value.filter((order) => {
        // Se il filtroData è impostato, confronta la data
        const matchData = filtroData.value
          ? order.data === filtroData.value
          : true;

        // Se il filtroCliente è impostato, verifica che il nome cliente contenga la stringa
        const matchCliente = filtroCliente.value
          ? order.cliente.toLowerCase().includes(filtroCliente.value.toLowerCase())
          : true;

        // Se il filtroLavorazione è impostato, verifica la lavorazione
        const matchLavorazione = filtroLavorazione.value
          ? order.lavorazione === filtroLavorazione.value
          : true;

        // Se il filtroTurno è impostato, verifica il turno
        const matchTurno = filtroTurno.value
          ? order.turno === filtroTurno.value
          : true;

        // Se il filtroStato è impostato, verifica lo stato
        const matchStato = filtroStato.value
          ? order.stato === filtroStato.value
          : true;

        // Deve soddisfare tutti i filtri per essere incluso
        return matchData && matchCliente && matchLavorazione && matchTurno && matchStato;
      });
    });

    // Formatta la data da YYYY-MM-DD a DD/MM/YYYY
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const parts = dateStr.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    // Esporta gli ordini filtrati in CSV
    const exportCSV = () => {
      if (!filteredOrders.value.length) {
        alert("Nessun ordine da esportare!");
        return;
      }
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Cliente,Materiale,Lavorazione,Data,Job ID,Numero Ordine,Stato,Turno\n";
      filteredOrders.value.forEach((order) => {
        const row = [
          order.cliente,
          order.materiale,
          order.lavorazione,
          formatDate(order.data),
          order.jobId,
          order.numeroOrdine,
          order.stato,
          order.turno,
        ].join(",");
        csvContent += row + "\n";
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "ordini_archiviati.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Esporta gli ordini filtrati in Excel
    const exportExcel = () => {
      if (!filteredOrders.value.length) {
        alert("Nessun ordine da esportare!");
        return;
      }
      const dataForExcel = filteredOrders.value.map((order) => ({
        Cliente: order.cliente,
        Materiale: order.materiale,
        Lavorazione: order.lavorazione,
        Data: formatDate(order.data),
        "Job ID": order.jobId,
        "Numero Ordine": order.numeroOrdine,
        Stato: order.stato,
        Turno: order.turno,
      }));
      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ordini Archiviati");
      XLSX.writeFile(wb, "ordini_archiviati.xlsx");
    };

    // Elimina un ordine archiviato da Firestore
    const deleteOrder = async (order) => {
      if (confirm(`Sei sicuro di voler eliminare l'ordine di ${order.cliente}?`)) {
        const orderRef = doc(db, "orders", order.id);
        await deleteDoc(orderRef);
        alert("Ordine eliminato!");
      }
    };

    // Resetta tutti i filtri
    const resetFiltri = () => {
      filtroData.value = "";
      filtroCliente.value = "";
      filtroLavorazione.value = "";
      filtroTurno.value = "";
      filtroStato.value = "";
    };

    return {
      orders,
      filtroData,
      filtroCliente,
      filtroLavorazione,
      filtroTurno,
      filtroStato,
      filteredOrders,
      formatDate,
      exportCSV,
      exportExcel,
      deleteOrder,
      resetFiltri,
    };
  },
};
</script>

<style scoped>
.archivio-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
  text-align: center;
  background-color: #222;
  color: #fff;
}

/* Sezione filtri */
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
  color: #fff;
}

.filter-item input,
.filter-item select {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 180px;
  background-color: #f0f0f0;
  color: #333;
}

.reset-btn {
  padding: 10px 20px;
  font-size: 16px;
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 5px;
  align-self: center;
  cursor: pointer;
}

.reset-btn:hover {
  background: #5a6268;
}

/* Pulsanti di esportazione */
.export-btns {
  margin-bottom: 20px;
}

.export-btn {
  padding: 10px 20px;
  font-size: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  margin-right: 10px;
  cursor: pointer;
}

.export-btn:hover {
  background: #0056b3;
}

/* Tabella degli ordini */
.order-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #000;
}

.order-table th,
.order-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.order-table th {
  background: #f4f4f4;
  font-weight: bold;
}

/* Pulsante elimina */
.delete-btn {
  padding: 5px 10px;
  font-size: 14px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #c82333;
}

/* Responsive */
@media (max-width: 768px) {
  .order-table {
    font-size: 14px;
  }
}
</style>
