<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotesStore } from '../stores/notes';

export default {
  name: 'NoteForm',
  props: {
    noteId: {
      type: [String, Number],
      default: null
    }
  },
  setup(props) {
    const router = useRouter();
    const notesStore = useNotesStore();

    const isEditing = ref(!!props.noteId);
    const loading = ref(false);

    const categories = [
      'Personal',
      'Trabajo',
      'Estudio',
      'Proyectos',
      'Ideas',
      'Recordatorios'
    ];

    const form = ref({
      title: '',
      category: '',
      content: '',
      is_favorite: false
    });

    onMounted(async () => {
      if (props.noteId) {
        loading.value = true;
        try {
          const note = await notesStore.getNoteById(props.noteId);
          if (note) {
            form.value = { ...note };
          } else {
            router.push('/');
          }
        } catch (error) {
          console.error('Error al cargar la nota:', error);
          router.push('/');
        } finally {
          loading.value = false;
        }
      }
    });

    const saveNote = async () => {
      loading.value = true;
      try {
        if (props.noteId) {
          await notesStore.updateNote(props.noteId, form.value);
        } else {
          await notesStore.createNote(form.value);
        }
        router.push('/');
      } catch (error) {
        console.error('Error al guardar la nota:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      } finally {
        loading.value = false;
      }
    };

    return {
      isEditing,
      loading,
      categories,
      form,
      saveNote,
      router
    };
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">{{ isEditing ? 'Editar Nota' : 'Nueva Nota' }}</h2>
    
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
    </div>
    
    <form v-else @submit.prevent="saveNote">
      <div class="space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            placeholder="Título de la nota"
            required
          />
        </div>
        
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
          <select
            id="category"
            v-model="form.category"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            required
          >
            <option value="" disabled>Selecciona una categoría</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
        
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contenido</label>
          <textarea
            id="content"
            v-model="form.content"
            rows="6"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            placeholder="Escribe el contenido de tu nota aquí..."
            required
          ></textarea>
        </div>
        
        <div class="flex items-center">
          <input
            id="is_favorite"
            v-model="form.is_favorite"
            type="checkbox"
            class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200"
          />
          <label for="is_favorite" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Marcar como favorita</label>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="router.back()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            {{ isEditing ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Los estilos se manejan con Tailwind CSS */
</style>