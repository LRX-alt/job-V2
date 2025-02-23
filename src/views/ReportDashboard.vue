<template>
  <div class="dashboard-container">
    <h2>📊 Report e Statistiche</h2>

    <!-- Grafico con stato degli ordini -->
    <div class="chart-container">
      <canvas ref="ordersChart"></canvas>
    </div>

    <!-- Pulsanti per esportazione -->
    <div class="export-buttons">
      <button @click="exportCSV" class="btn export-btn">📄 Esporta CSV</button>
      <button @click="exportExcel" class="btn export-btn">📊 Esporta Excel</button>
      <button @click="exportPDF" class="btn export-btn">📑 Esporta PDF</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export default {
  setup() {
    const orders = ref([]);
    const ordersChart = ref(null);
    
    // Recupera gli ordini in tempo reale
    onMounted(() => {
      onSnapshot(collection(db, "orders"), (snapshot) => {
        orders.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        renderChart(); // Rendi il grafico dopo aver ottenuto i dati
      });
    });

    // Genera il grafico con i dati degli ordini per stato
    const renderChart = () => {
      if (ordersChart.value) {
        ordersChart.value.destroy(); // Rimuove il vecchio grafico
      }

      const ctx = document.querySelector("canvas").getContext("2d");
      const stati = ["In attesa", "In lavorazione", "Lavorato"];
      const counts = stati.map(
        (stato) => orders.value.filter((o) => o.stato === stato).length
      );

      ordersChart.value = new Chart(ctx, {
        type: "bar",
        data: {
          labels: stati,
          datasets: [
            {
              label: "Numero di Ordini",
              data: counts,
              backgroundColor: ["red", "yellow", "green"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    };

    // Funzione per esportare CSV
    const exportCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,Cliente,Stato,Materiale,Data\n";
      orders.value.forEach((order) => {
        csvContent += `${order.cliente},${order.stato},${order.materiale},${order.data}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "report_ordini.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Funzione per esportare Excel
    const exportExcel = () => {
      const ws = XLSX.utils.json_to_sheet(
        orders.value.map((order) => ({
          Cliente: order.cliente,
          Stato: order.stato,
          Materiale: order.materiale,
          Data: order.data,
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ordini");
      XLSX.writeFile(wb, "report_ordini.xlsx");
    };

    // Funzione per esportare PDF
    const exportPDF = () => {
      const pdf = new jsPDF();
      pdf.text("📊 Report Ordini", 10, 10);

      let y = 20;
      orders.value.forEach((order) => {
        pdf.text(`Cliente: ${order.cliente}`, 10, y);
        pdf.text(`Stato: ${order.stato}`, 70, y);
        pdf.text(`Materiale: ${order.materiale}`, 120, y);
        pdf.text(`Data: ${order.data}`, 170, y);
        y += 10;
      });

      pdf.save("report_ordini.pdf");
    };

    return {
      ordersChart,
      exportCSV,
      exportExcel,
      exportPDF,
    };
  },
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  text-align: center;
}

.chart-container {
  width: 80%;
  max-width: 600px;
  margin: auto;
}

.export-buttons {
  margin-top: 20px;
}

.btn {
  padding: 10px 15px;
  margin: 5px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}
</style>
