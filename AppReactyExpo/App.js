import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

async function obtenerPopularidadPorGenero() {
  try {
    const respuesta = await fetch('https://gamebrain.co/api/games');
    const juegos = await respuesta.json();

    const generoStats = new Map();

    juegos.forEach(juego => {
      if (juego.genres && juego.genres.length > 0 && juego.popularity) {
        juego.genres.forEach(genero => {
          if (!generoStats.has(genero)) {
            generoStats.set(genero, { sumaPopularidad: 0, cantidad: 0 });
          }
          
          const stats = generoStats.get(genero);
          stats.sumaPopularidad += juego.popularity;
          stats.cantidad++;
          generoStats.set(genero, stats);
        });
      }
    });

    const promediosPorGenero = [];
    
    for (const [genero, stats] of generoStats.entries()) {
      const promedio = stats.sumaPopularidad / stats.cantidad;
      promediosPorGenero.push({
        genero: genero,
        promedioPopularidad: parseFloat(promedio.toFixed(2)),
        totalJuegos: stats.cantidad
      });
    }

    promediosPorGenero.sort((a, b) => b.promedioPopularidad - a.promedioPopularidad);
    return promediosPorGenero;

  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export default function App() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerPopularidadPorGenero()
      .then(resultado => {
        setDatos(resultado);
        setCargando(false);
      })
      .catch(error => {
        console.error(error);
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Popularidad por género</Text>
      
      {datos.slice(0, 10).map((item, index) => (
        <View key={item.genero} style={styles.card}>
          <Text style={styles.rank}>{index + 1}</Text>
          <View style={styles.info}>
            <Text style={styles.genero}>{item.genero}</Text>
            <Text style={styles.popularidad}>{item.promedioPopularidad} puntos</Text>
            <Text style={styles.totalJuegos}>{item.totalJuegos} juegos</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  genero: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  popularidad: {
    fontSize: 14,
    color: '#ff9800',
  },
  totalJuegos: {
    fontSize: 12,
    color: '#666',
  },
});