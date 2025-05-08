<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NoteList from '../components/NoteList.vue';
import { useNotesStore } from '../stores/notes';

export default {
  name: 'Favorites',
  components: {
    NoteList
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const notesStore = useNotesStore();

    const loading = ref(true);
    const selectedCategory = ref('');
    const searchQuery = ref('');

    const categories = [
      'Personal',
      'Trabajo',
      'Estudio',
      'Proyectos',
      'Ideas',
      'Recordatorios'
    ];

    // Computed properties
    const filteredNotes = computed(() => {
      let result = [...notesStore.notes].filter(note => note.is_favorite);

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(note => 
          note.title.toLowerCase().includes(query) || 
          note.content.toLowerCase().includes(query)
        );
      }

      // Filter by category
      if (selectedCategory.value) {
        result = result.filter(note => note.category === selectedCategory.value);
      }

      return result;
    });

    // Watch for route query changes
    watch(() => route.query.search, (newQuery) => {
      searchQuery.value = newQuery || '';
    });

    watch(() => route.query.category, (newCategory) => {
      selectedCategory.value = newCategory || '';
    });

    // Watch for category selection changes
    watch(selectedCategory, (newCategory) => {
      router.push({
        query: { 
          ...route.query,
          category: newCategory || undefined 
        }
      });
    });

    // Methods
    const loadNotes = async () => {
      loading.value = true;
      try {
        const params = {
          category: selectedCategory.value,
          search: searchQuery.value,
          favorite: true
        };
        
        await notesStore.fetchNotes(params);
      } catch (error) {
        console.error('Error al cargar las notas favoritas:', error);
      } finally {
        loading.value = false;
      }
    };

    const editNote = (id) => {
      router.push(`/notes/edit/${id}`);
    };

    const deleteNote = async (id) => {
      if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
        try {
          await notesStore.deleteNote(id);
        } catch (error) {
          console.error('Error al eliminar la nota:', error);
        }
      }
    };

    const viewNote = (id) => {
      router.push(`/notes/${id}`);
    };

    const toggleFavorite = async (id) => {
      try {
        await notesStore.toggleFavorite(id);
      } catch (error) {
        console.error('Error al actualizar favorito:', error);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      searchQuery.value = route.query.search || '';
      selectedCategory.value = route.query.category || '';
      await loadNotes();
    });

    return {
      loading,
      selectedCategory,
      categories,
      filteredNotes,
      editNote,
      deleteNote,
      viewNote,
      toggleFavorite
    };
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mis Favoritos</h1>
        <div class="mt-3 sm:mt-0 flex items-center space-x-2">
          <div class="relative">
            <select
              v-model="selectedCategory"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white transition-colors duration-200"
            >
              <option value="">Todas las categorías</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <NoteList
      title="Notas Favoritas"
      :notes="filteredNotes"
      :loading="loading"
      :current-page="1"
      :total-pages="1"
      @edit="editNote"
      @delete="deleteNote"
      @view="viewNote"
      @toggle-favorite="toggleFavorite"
    />
  </div>
</template>

<style scoped>
/* Los estilos se manejan con Tailwind CSS */
</style>