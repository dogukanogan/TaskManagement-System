import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TaskService } from '../../../core/services/task.service';
import { TaskCommentService } from '../../../core/services/task-comment.service';
import { TaskAttachmentService } from '../../../core/services/task-attachment.service';
import { TaskItem } from '../../../core/models/task.model';
import { TaskComment } from '../../../core/models/comment.model';
import { TaskAttachment } from '../../../core/models/attachment.model';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatDialogModule
    ],
    templateUrl: './task-detail.component.html',
    styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent implements OnInit {
    private taskAttachmentService = inject(TaskAttachmentService);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private taskService: TaskService,
        private commentService: TaskCommentService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    task = signal<TaskItem | null>(null);
    loading = signal(true);

    comments = signal<TaskComment[]>([]);
    newCommentText = signal('');
    submittingComment = signal(false);

    attachments = signal<TaskAttachment[]>([]);
    uploading = signal(false);

    ngOnInit(): void {
        const taskId = this.route.snapshot.paramMap.get('id');
        if (taskId) {
            this.loadTask(taskId);
            this.loadComments(taskId);
            this.loadAttachments(taskId);
        } else {
            this.snackBar.open('Görev ID bulunamadı!', 'Kapat', { duration: 3000 });
            this.router.navigate(['/tasks']);
        }
    }

    /**
     * Görev detaylarını sunucudan getirir.
     */
    loadTask(id: string): void {
        this.loading.set(true);
        this.taskService.getById(id).subscribe({
            next: (data) => {
                this.task.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Görev yüklenirken hata:', err);
                this.snackBar.open('Görev detayları alınamadı!', 'Kapat', { duration: 3000 });
                this.router.navigate(['/tasks']);
            }
        });
    }

    /**
     * Göreve ait yorumları sunucudan getirir.
     */
    loadComments(taskId: string): void {
        this.commentService.getAll(taskId).subscribe({
            next: (data) => this.comments.set(data),
            error: (err) => console.error('Yorumlar yüklenemedi:', err)
        });
    }

    /**
     * Göreve yeni bir yorum ekler.
     */
    addComment(): void {
        const text = this.newCommentText().trim();
        const currentTask = this.task();

        if (!text || !currentTask) return;

        this.submittingComment.set(true);

        const payload = { comment: text };

        this.commentService.add(currentTask.id, payload).subscribe({
            next: () => {
                this.newCommentText.set('');
                this.submittingComment.set(false);
                this.loadComments(currentTask.id);
                this.snackBar.open('Yorum eklendi!', 'Kapat', { duration: 2000 });
            },
            error: (err) => {
                console.error('Yorum ekleme hatası:', err);
                this.submittingComment.set(false);
                this.snackBar.open('Yorum eklenirken hata oluştu!', 'Kapat', { duration: 3000 });
            }
        });
    }

    /**
     * Göreve ait tüm dosya eklerini sunucudan çeker ve listeyi günceller.
     */
    loadAttachments(taskId: string): void {
        this.taskAttachmentService.getAll(taskId).subscribe({
            next: (data) => this.attachments.set(data),
            error: (err) => console.error('Dosya ekleri yüklenirken hata oluştu:', err)
        });
    }

    /**
     * Kullanıcının seçtiği dosyayı sunucuya yükler.
     * Not: Servis katmanı FormData sarmalamasını kendisi yaptığı için doğrudan File nesnesi gönderilmektedir.
     */
    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        const currentTask = this.task();

        if (!file || !currentTask) return;

        this.uploading.set(true);

        this.taskAttachmentService.upload(currentTask.id, file).subscribe({
            next: () => {
                this.snackBar.open('Dosya başarıyla yüklendi.', 'Kapat', { duration: 3000 });
                this.loadAttachments(currentTask.id);
                this.uploading.set(false);
            },
            error: (err) => {
                console.error('Dosya yükleme işlemi başarısız:', err);
                this.snackBar.open('Dosya yüklenemedi.', 'Kapat', { duration: 3000 });
                this.uploading.set(false);
            }
        });
    }

    /**
     * Belirtilen dosyayı sunucudan Blob formatında indirir ve tarayıcı indirme yöneticisini tetikler.
     */
    downloadAttachment(attachmentId: string, fileName: string): void {
        const currentTask = this.task();
        if (!currentTask) return;

        this.taskAttachmentService.download(currentTask.id, attachmentId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            },
            error: (err) => {
                console.error('Dosya indirme işlemi başarısız:', err);
                this.snackBar.open('Dosya indirilemedi.', 'Kapat', { duration: 3000 });
            }
        });
    }

    /**
     * Seçilen dosya ekini sistemden kalıcı olarak siler.
     */
    deleteAttachment(attachmentId: string): void {
        const currentTask = this.task();
        if (!currentTask) return;

        if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;

        this.taskAttachmentService.delete(currentTask.id, attachmentId).subscribe({
            next: () => {
                this.snackBar.open('Dosya başarıyla silindi.', 'Kapat', { duration: 3000 });
                this.loadAttachments(currentTask.id);
            },
            error: (err) => {
                console.error('Dosya silinirken hata oluştu:', err);
                this.snackBar.open('Dosya silinemedi.', 'Kapat', { duration: 3000 });
            }
        });
    }

    /**
     * Öncelik değerine karşılık gelen metni döndürür.
     */
    getPriorityLabel(priority: number): string {
        const labels: Record<number, string> = { 1: 'Düşük', 2: 'Normal', 3: 'Yüksek', 4: 'Acil', 5: 'Kritik' };
        return labels[priority] || 'Bilinmiyor';
    }

    /**
     * Görev durum değerine karşılık gelen metni döndürür.
     */
    getStatusLabel(status: number): string {
        const labels: Record<number, string> = { 0: 'Bekliyor', 1: 'Devam Ediyor', 2: 'Tamamlandı', 3: 'İptal Edildi' };
        return labels[status] || 'Bilinmiyor';
    }

    getStatusColorClass(status: number): string {
        switch (status) {
            case 0: return 'status-pending';
            case 1: return 'status-inprogress';
            case 2: return 'status-completed';
            case 3: return 'status-cancelled';
            default: return '';
        }
    }

    getPriorityColorClass(priority: number): string {
        switch (priority) {
            case 1: return 'priority-low';
            case 2: return 'priority-normal';
            case 3: return 'priority-high';
            case 4: return 'priority-urgent';
            case 5: return 'priority-critical';
            default: return '';
        }
    }

    formatDateTR(dateStr: string | null | undefined): string {
        if (!dateStr) return 'Belirtilmemiş';
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    /**
     * Görevin mevcut durumunu günceller.
     */
    updateStatus(newStatus: number): void {
        const currentTask = this.task();
        if (!currentTask) return;

        const payload = {
            id: currentTask.id,
            title: currentTask.title,
            description: currentTask.description,
            categoryId: currentTask.categoryId,
            priority: currentTask.priority,
            dueDate: currentTask.dueDate,
            status: newStatus
        };

        this.taskService.update(currentTask.id, payload).subscribe({
            next: () => {
                this.snackBar.open('Görev durumu güncellendi!', 'Kapat', { duration: 3000 });
                this.loadTask(currentTask.id);
            },
            error: (err) => {
                console.error('Statü güncelleme hatası:', err);
                this.snackBar.open('Durum güncellenirken bir hata oluştu!', 'Kapat', { duration: 3000 });
            }
        });
    }
    /**
     * Görevin önceliğini günceller.
     */
    updatePriority(newPriority: number): void {
        const currentTask = this.task();
        if (!currentTask) return;

        const payload = {
            id: currentTask.id,
            title: currentTask.title,
            description: currentTask.description,
            categoryId: currentTask.categoryId,
            priority: newPriority,
            dueDate: currentTask.dueDate,
            status: currentTask.status
        };

        this.taskService.update(currentTask.id, payload).subscribe({
            next: () => {
                this.snackBar.open('Görev önceliği güncellendi!', 'Kapat', { duration: 3000 });
                this.loadTask(currentTask.id);
            },
            error: (err) => {
                console.error('Öncelik güncelleme hatası:', err);
                this.snackBar.open('Öncelik güncellenirken bir hata oluştu!', 'Kapat', { duration: 3000 });
            }
        });
    }

    /**
     * Görevi siler (öncesinde onay alır).
     */
    deleteTask(): void {
        const currentTask = this.task();
        if (!currentTask) return;

        const dialogRef = this.dialog.open(ConfirmDialog, {
            width: '400px',
            data: {
                title: 'Görevi Sil',
                message: `"${currentTask.title}" isimli görevi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
                confirmText: 'Evet, Sil',
                cancelText: 'Vazgeç'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.taskService.delete(currentTask.id).subscribe({
                    next: () => {
                        this.snackBar.open('Görev başarıyla silindi.', 'Kapat', { duration: 3000 });
                        this.router.navigate(['/tasks']);
                    },
                    error: (err) => {
                        console.error('Silme hatası:', err);
                        this.snackBar.open('Görev silinirken bir hata oluştu.', 'Kapat', { duration: 3000 });
                    }
                });
            }
        });
    }
}