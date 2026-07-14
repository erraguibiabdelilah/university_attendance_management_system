import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { JustificationService, JustificationDto } from '../../shared/services/justification-service';

@Component({
    selector: 'app-justifications',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './justifications.component.html',
    styleUrl: './justifications.component.scss'
})
export class JustificationsComponent implements OnInit, OnDestroy {

    justifications: JustificationDto[] = [];
    filtered: JustificationDto[] = [];
    isLoading = false;
    filterStatut = 'ALL';

    showRefusModal = false;
    selectedJustification: JustificationDto | null = null;
    motifRefus = '';
    isSaving = false;

    showToast = false;
    toastMessage = '';
    toastType: 'success' | 'error' = 'success';

    private destroy$ = new Subject<void>();

    encodeURIComponent = encodeURIComponent;

    constructor(private service: JustificationService) { }

    ngOnInit(): void { this.loadAll(); }

    ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

    loadAll(): void {
        this.isLoading = true;
        this.service.findAll().pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => { this.justifications = data; this.applyFilter(); this.isLoading = false; },
            error: () => { this.isLoading = false; }
        });
    }

    setFilter(statut: string): void { this.filterStatut = statut; this.applyFilter(); }

    private applyFilter(): void {
        this.filtered = this.filterStatut === 'ALL'
            ? [...this.justifications]
            : this.justifications.filter(j => j.statut === this.filterStatut);
    }

    count(statut: string): number {
        return statut === 'ALL' ? this.justifications.length : this.justifications.filter(j => j.statut === statut).length;
    }

    valider(j: JustificationDto): void {
        if (!j.id) return;
        this.isSaving = true;
        this.service.updateStatut(j.id, 'VALIDE').pipe(takeUntil(this.destroy$)).subscribe({
            next: () => { this.isSaving = false; this.loadAll(); this.triggerToast('Justification validée', 'success'); },
            error: () => { this.isSaving = false; }
        });
    }

    openRefusModal(j: JustificationDto): void { this.selectedJustification = j; this.motifRefus = ''; this.showRefusModal = true; }

    closeRefusModal(): void { this.showRefusModal = false; this.selectedJustification = null; }

    confirmerRefus(): void {
        if (!this.selectedJustification?.id || !this.motifRefus.trim()) return;
        this.isSaving = true;
        this.service.updateStatut(this.selectedJustification.id, 'REFUSE', this.motifRefus)
            .pipe(takeUntil(this.destroy$)).subscribe({
                next: () => { this.isSaving = false; this.closeRefusModal(); this.loadAll(); this.triggerToast('Justification refusée', 'error'); },
                error: () => { this.isSaving = false; }
            });
    }

    getStatutClass(statut: string): string {
        return ({ EN_ATTENTE: 'badge-warning', VALIDE: 'badge-success', REFUSE: 'badge-danger' } as any)[statut] ?? '';
    }

    getStatutLabel(statut: string): string {
        return ({ EN_ATTENTE: 'En attente', VALIDE: 'Validée', REFUSE: 'Refusée' } as any)[statut] ?? statut;
    }

    private triggerToast(message: string, type: 'success' | 'error'): void {
        this.toastMessage = message; this.toastType = type; this.showToast = true;
        setTimeout(() => this.showToast = false, 3000);
    }
}
