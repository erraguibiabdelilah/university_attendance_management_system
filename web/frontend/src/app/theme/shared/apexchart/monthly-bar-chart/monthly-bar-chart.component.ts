// angular import
import { Component, Input, OnChanges, OnInit, SimpleChanges, viewChild } from '@angular/core';

// third party
import { NgApexchartsModule, ChartComponent, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-monthly-bar-chart',
  imports: [NgApexchartsModule],
  templateUrl: './monthly-bar-chart.component.html',
  styleUrl: './monthly-bar-chart.component.scss'
})
export class MonthlyBarChartComponent implements OnInit, OnChanges {
  @Input() absencesParMoisParFiliere: { [filiere: string]: number[] } = {};

  chart = viewChild.required<ChartComponent>('chart');
  chartOptions!: Partial<ApexOptions>;

  private readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private readonly colors = ['#1677ff', '#0050b3', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1'];

  ngOnInit() {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['absencesParMoisParFiliere']) {
      this.buildChart();
    }
  }

  private buildChart() {
    const filieres = Object.keys(this.absencesParMoisParFiliere);
    const series = filieres.length > 0
      ? filieres.map((filiere, i) => ({
          name: filiere,
          data: this.absencesParMoisParFiliere[filiere]
        }))
      : [{ name: 'Absences', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }];

    this.chartOptions = {
      chart: {
        height: 450,
        type: 'area',
        toolbar: { show: false },
        background: 'transparent'
      },
      dataLabels: { enabled: false },
      colors: this.colors,
      series,
      stroke: { curve: 'smooth', width: 2 },
      xaxis: {
        categories: this.months,
        labels: {
          style: {
            colors: Array(12).fill('#8c8c8c')
          }
        },
        axisBorder: { show: true, color: '#f0f0f0' }
      },
      yaxis: {
        labels: { style: { colors: ['#8c8c8c'] } }
      },
      grid: { strokeDashArray: 0, borderColor: '#f5f5f5' },
      theme: { mode: 'light' }
    };
  }

  // Gardé pour compatibilité avec le template HTML existant
  toggleActive(_value: string) {}
}
