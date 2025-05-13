<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useNotesStore } from '../stores/notes';
import { StarIcon, EditIcon, DeleteIcon, BackIcon, NotFoundIcon } from '../components/icons';

export default {
  name: 'NoteDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const notesStore = useNotesStore();
    const toast = useToast();

    const note = ref(null);
    const loading = ref(true);
    const isFavoriteLoading = ref(false);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const loadNote = async () => {
      loading.value = true;
      try {
        const noteId = route.params.id;
        const fetchedNote = await notesStore.getNoteById(noteId);
        note.value = fetchedNote;
        if (!fetchedNote) {
          toast.error('Nota no encontrada');
        }
      } catch (error) {
        console.error('Error al cargar la nota:', error);
        toast.error('Error al cargar la nota: ' + (error.message || 'Error desconocido'));
        note.value = null;
      } finally {
        loading.value = false;
      }
    };

    const toggleFavorite = async () => {
      if (!note.value) return;
      isFavoriteLoading.value = true;
      try {
        const wasFavorite = note.value.is_favorite;
        note.value.is_favorite = !wasFavorite;
        await notesStore.updateNote(note.value.id, note.value);
        const message = note.value.is_favorite 
          ? 'Nota añadida a favoritos' 
          : 'Nota eliminada de favoritos';
        toast.success(message);
      } catch (error) {
        console.error('Error al actualizar favorito:', error);
        toast.error('Error al actualizar favorito: ' + (error.message || 'Error desconocido'));
        // Revert the change in case of error
        note.value.is_favorite = !note.value.is_favorite;
      } finally {
        isFavoriteLoading.value = false;
      }
    };

    const deleteNote = async () => {
      if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
        try {
          await notesStore.deleteNote(note.value.id);
          toast.success('Nota eliminada correctamente');
          router.push('/');
        } catch (error) {
          console.error('Error al eliminar la nota:', error);
          toast.error('Error al eliminar la nota: ' + (error.message || 'Error desconocido'));
        }
      }
    };

    onMounted(() => {
      loadNote();
    });

    return {
      note,
      loading,
      formatDate,
      toggleFavorite,
      deleteNote,
      StarIcon,
      EditIcon,
      DeleteIcon,
      BackIcon,
      NotFoundIcon
    };
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    
    <div v-else-if="!note" class="bg-white dark:bg-[#1a202c] rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
      <span v-html="NotFoundIcon"></span>
      <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">Nota no encontrada</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">La nota que buscas no existe o ha sido eliminada.</p>
      <div class="mt-6">
        <router-link to="/" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Volver al inicio
        </router-link>
      </div>
    </div>
    
    <div v-else>
      <div class="mb-6 flex items-center justify-between">
        <router-link to="/" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
          <span v-html="BackIcon"></span>
          Volver
        </router-link>
        
        <div class="flex space-x-2">
          <button 
            @click="toggleFavorite" 
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            :disabled="isFavoriteLoading"
          >
            <span v-html="StarIcon" :class="note.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'"></span>
          </button>
          <router-link :to="`/notes/edit/${note.id}`" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <span v-html="EditIcon" class="text-gray-600 dark:text-gray-400"></span>
          </router-link>
          <button @click="deleteNote" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <span v-html="DeleteIcon" class="text-gray-600 dark:text-gray-400"></span>
          </button>
        </div>
      </div>
      
      <div class="bg-white dark:bg-[#1a202c] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ note.title }}</h1>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {{ note.category }}
            </span>
          </div>
          
          <div class="prose dark:prose-invert max-w-none">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ note.content }}</p>
          </div>
          
          <div class="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Creado el {{ formatDate(note.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Los estilos se manejan con Tailwind CSS */
</style>