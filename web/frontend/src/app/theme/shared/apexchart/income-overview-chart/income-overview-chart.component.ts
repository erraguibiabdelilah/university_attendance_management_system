// angular import
import { Component, Input, OnChanges, OnInit, SimpleChanges, viewChild } from '@angular/core';

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-income-overview-chart',
  imports: [CardComponent, NgApexchartsModule],
  templateUrl: './income-overview-chart.component.html',
  styleUrl: './income-overview-chart.component.scss'
})
export class IncomeOverviewChartComponent implements OnInit, OnChanges {
  @Input() absencesTotalParFiliere: { [filiere: string]: number } = {};

  get totalAbsences(): number {
    return Object.values(this.absencesTotalParFiliere).reduce((a, b) => a + b, 0);
  }

  chart = viewChild.required<ChartComponent>('chart');
  chartOptions!: Partial<ApexOptions>;

  ngOnInit() {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['absencesTotalParFiliere']) {
      this.buildChart();
    }
  }

  private buildChart() {
    const filieres = Object.keys(this.absencesTotalParFiliere);
    const values = filieres.map(f => this.absencesTotalParFiliere[f]);

    const categories = filieres.length > 0 ? filieres : ['—'];
    const data = values.length > 0 ? values : [0];

    this.chartOptions = {
      chart: {
        type: 'bar',
        height: 365,
        toolbar: { show: false },
        background: 'transparent'
      },
      plotOptions: {
        bar: { columnWidth: '45%', borderRadius: 4 }
      },
      dataLabels: { enabled: false },
      series: [{ name: 'Absences', data }],
      stroke: { curve: 'smooth', width: 2 },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: Array(categories.length).fill('#8c8c8c')
          }
        }
      },
      yaxis: { show: false },
      colors: ['#5cdbd3'],
      grid: { show: false },
      tooltip: { theme: 'light' }
    };
  }
}
