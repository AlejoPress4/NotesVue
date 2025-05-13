<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
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
    const toast = useToast();

    const isEditing = ref(!!props.noteId);
    const loading = ref(false);
    const error = ref(null);

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
            toast.error('Nota no encontrada');
            router.push('/');
          }
        } catch (err) {
          console.error('Error al cargar la nota:', err);
          toast.error('Error al cargar la nota: ' + (err.message || 'Error desconocido'));
          router.push('/');
        } finally {
          loading.value = false;
        }
      }
    });

    const saveNote = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        // Validar formulario
        if (!form.value.title.trim()) {
          error.value = 'El título es obligatorio';
          toast.error('El título es obligatorio');
          loading.value = false;
          return;
        }
        if (!form.value.category) {
          error.value = 'La categoría es obligatoria';
          toast.error('La categoría es obligatoria');
          loading.value = false;
          return;
        }
        if (!form.value.content.trim()) {
          error.value = 'El contenido es obligatorio';
          toast.error('El contenido es obligatorio');
          loading.value = false;
          return;
        }
        
        if (props.noteId) {
          await notesStore.updateNote(props.noteId, form.value);
          toast.success('Nota actualizada correctamente');
        } else {
          await notesStore.createNote(form.value);
          toast.success('Nota creada correctamente');
        }
        router.push('/');
      } catch (err) {
        console.error('Error al guardar la nota:', err);
        error.value = err.response?.data?.errors || err.message || 'Error al guardar la nota';
        toast.error('Error al guardar la nota: ' + (Array.isArray(error.value) ? error.value.join(', ') : error.value));
      } finally {
        loading.value = false;
      }
    };

    return {
      isEditing,
      loading,
      error,
      categories,
      form,
      saveNote,
      router
    };
  }
}
</script>

<template>
  <div class="bg-white dark:bg-[#1a202c] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">{{ isEditing ? 'Editar Nota' : 'Nueva Nota' }}</h2>
    
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    
    <form v-else @submit.prevent="saveNote">
      <div class="space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            placeholder="Título de la nota"
            required
          />
        </div>
        
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
          <select
            id="category"
            v-model="form.category"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
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
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            placeholder="Escribe el contenido de tu nota aquí..."
            required
          ></textarea>
        </div>
        
        <div class="flex items-center">
          <input
            id="is_favorite"
            v-model="form.is_favorite"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200"
          />
          <label for="is_favorite" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Marcar como favorita</label>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="router.back()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
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