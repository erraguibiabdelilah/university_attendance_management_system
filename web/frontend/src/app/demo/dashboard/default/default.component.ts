import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyBarChartComponent } from 'src/app/theme/shared/apexchart/monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from 'src/app/theme/shared/apexchart/income-overview-chart/income-overview-chart.component';
import { StatisticsService, StatisticsDto } from 'src/app/shared/services/statistics.service';
import { IconService, IconDirective } from '@ant-design/icons-angular';
import { FallOutline, RiseOutline } from '@ant-design/icons-angular/icons';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-default',
  imports: [CommonModule, CardComponent, IconDirective, MonthlyBarChartComponent, IncomeOverviewChartComponent],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  private iconService = inject(IconService);
  private statisticsService = inject(StatisticsService);

  constructor() {
    this.iconService.addIcon(...[RiseOutline, FallOutline]);
  }

  absencesParMoisParFiliere: { [filiere: string]: number[] } = {};
  absencesTotalParFiliere: { [filiere: string]: number } = {};

  AnalyticEcommerce = [
    { title: 'Total Étudiants', amount: '—', background: 'bg-light-primary', border: 'border-primary', icon: 'rise', percentage: '', color: 'text-primary', number: '' },
    { title: 'Total Professeurs', amount: '—', background: 'bg-light-primary', border: 'border-primary', icon: 'rise', percentage: '', color: 'text-primary', number: '' },
    { title: "Taux d'absence", amount: '—', background: 'bg-light-warning', border: 'border-warning', icon: 'fall', percentage: '', color: 'text-warning', number: '' }
  ];

  ngOnInit() {
    this.statisticsService.getStatistics().subscribe({
      next: (data: StatisticsDto) => {
        this.AnalyticEcommerce[0].amount = data.totalStudents.toString();
        this.AnalyticEcommerce[1].amount = data.totalTeachers.toString();
        this.AnalyticEcommerce[2].amount = data.tauxAbsence + '%';
        this.absencesParMoisParFiliere = data.absencesParMoisParFiliere;
        this.absencesTotalParFiliere = data.absencesTotalParFiliere;
      },
      error: () => {}
    });
  }
}
