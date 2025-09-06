import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Video, FileText } from 'lucide-react';
import { formatBytes } from '@/utils/videoProcessing';
import { toast } from 'sonner';

interface VideoUploadProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  maxSize?: number; // in bytes
}

export function VideoUpload({ 
  onFilesSelected, 
  multiple = false, 
  disabled = false,
  maxSize = 50 * 1024 * 1024 // 50MB para alinear con Supabase Free tier
}: VideoUploadProps) {
  
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          switch (error.code) {
            case 'file-too-large':
              toast.error(`${file.name} es demasiado grande. Máximo ${formatBytes(maxSize)}`);
              break;
            case 'file-invalid-type':
              toast.error(`${file.name} no es un archivo de video válido`);
              break;
            default:
              toast.error(`Error con ${file.name}: ${error.message}`);
          }
        });
      });
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
      toast.success(
        `${acceptedFiles.length} video${acceptedFiles.length > 1 ? 's' : ''} seleccionado${acceptedFiles.length > 1 ? 's' : ''}`
      );
    }
  }, [onFilesSelected, maxSize]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    },
    multiple,
    disabled,
    maxSize
  });

  const getBorderColor = () => {
    if (disabled) return 'border-muted';
    if (isDragReject) return 'border-destructive';
    if (isDragActive) return 'border-primary';
    return 'border-border hover:border-primary';
  };

  const getBackgroundColor = () => {
    if (disabled) return 'bg-muted/20';
    if (isDragReject) return 'bg-destructive/10';
    if (isDragActive) return 'bg-primary/10';
    return 'bg-background hover:bg-muted/50';
  };

  return (
    <Card className={`transition-all duration-200 cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}>
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${getBorderColor()} ${getBackgroundColor()}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              {isDragActive ? (
                <Upload className="h-12 w-12 text-primary animate-bounce" />
              ) : (
                <Video className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {isDragActive ? 'Suelta los videos aquí' : 'Subir Videos'}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {multiple ? 
                  'Arrastra y suelta videos aquí, o haz clic para seleccionar múltiples archivos' :
                  'Arrastra y suelta un video aquí, o haz clic para seleccionar'
                }
              </p>
              
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>MP4, AVI, MOV, MKV</span>
                </div>
                <span>•</span>
                <span>Máximo {formatBytes(maxSize)}</span>
              </div>
            </div>
            
            {isDragReject && (
              <p className="text-sm text-destructive">
                Algunos archivos no son válidos
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}