<template>
  <div>
    <nav>
      <router-link to="/">Dashboard</router-link> |
      <router-link to="/archivio">Archivio Ordini</router-link> |
      <router-link to="/report">Report e Statistiche</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {};
</script>

<style>
nav {
  background: #222;
  padding: 10px;
  text-align: center;
}
nav a {
  color: white;
  text-decoration: none;
  margin: 0 10px;
  font-size: 18px;
}
nav a:hover {
  text-decoration: underline;
}
</style>
