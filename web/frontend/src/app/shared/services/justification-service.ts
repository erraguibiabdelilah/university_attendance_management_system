import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JustificationDto {
    id?: number;
    absenceDetailId: number;
    studentId: number;
    studentFirstName?: string;
    studentLastName?: string;
    studentCne?: string;
    fichierUrl: string;
    motif?: string;
    commentaire?: string;
    dateDepot?: string;
    statut?: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
    motifRefus?: string;
}

@Injectable({ providedIn: 'root' })
export class JustificationService {
    private base = environment.apiUrl + 'justification/';

    constructor(private http: HttpClient) { }

    findAll(): Observable<JustificationDto[]> {
        return this.http.get<JustificationDto[]>(this.base);
    }

    findByStatut(statut: string): Observable<JustificationDto[]> {
        return this.http.get<JustificationDto[]>(`${this.base}statut/${statut}`);
    }

    updateStatut(id: number, statut: string, motifRefus?: string): Observable<JustificationDto> {
        return this.http.put<JustificationDto>(`${this.base}${id}/statut`, { statut, motifRefus });
    }
}
