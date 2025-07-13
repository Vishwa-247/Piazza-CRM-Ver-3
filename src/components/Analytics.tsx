// import { useMemo } from 'react';
// import { TrendingUp, TrendingDown, Users, Target, Mail, Calendar } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Lead } from './Dashboard';
// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from 'recharts';

// interface AnalyticsProps {
//   leads: Lead[];
// }

// export const Analytics = ({ leads }: AnalyticsProps) => {
//   const analytics = useMemo(() => {
//     const totalLeads = leads.length;
//     const newLeads = leads.filter(l => l.status === 'new').length;
//     const contactedLeads = leads.filter(l => l.status === 'contacted').length;
//     const convertedLeads = leads.filter(l => l.status === 'converted').length;
    
//     const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
//     const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0;

//     // Generate realistic data based on actual leads
//     const last7Days = Array.from({ length: 7 }, (_, i) => {
//       const date = new Date();
//       date.setDate(date.getDate() - (6 - i));
      
//       // Calculate leads created on this day
//       const dayLeads = leads.filter(lead => {
//         const leadDate = new Date(lead.createdAt);
//         return leadDate.toDateString() === date.toDateString();
//       }).length;
      
//       return {
//         date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
//         leads: dayLeads,
//         contacts: Math.max(0, dayLeads - 1),
//         conversions: Math.max(0, Math.floor(dayLeads * 0.3)),
//       };
//     });

//     const sourceData = [
//       { name: 'Manual', value: leads.filter(l => l.source === 'Manual').length, color: '#3B82F6' },
//       { name: 'Document', value: leads.filter(l => l.source === 'Document').length, color: '#8B5CF6' },
//     ].filter(item => item.value > 0); // Only show sources with data

//     const statusData = [
//       { name: 'New', value: newLeads, color: '#10B981' },
//       { name: 'Contacted', value: contactedLeads, color: '#3B82F6' },
//     ].filter(item => item.value > 0); // Only show statuses with data

//     return {
//       totalLeads,
//       newLeads,
//       contactedLeads,
//       convertedLeads,
//       conversionRate,
//       contactRate,
//       last7Days,
//       sourceData,
//       statusData,
//     };
//   }, [leads]);

//   const kpiCards = [
//     {
//       title: 'Total Leads',
//       value: analytics.totalLeads,
//       change: '+12%',
//       trend: 'up',
//       icon: Users,
//       color: 'text-primary',
//     },
//     {
//       title: 'Conversion Rate',
//       value: `${analytics.conversionRate.toFixed(1)}%`,
//       change: '+5.2%',
//       trend: 'up',
//       icon: Target,
//       color: 'text-success',
//     },
//     {
//       title: 'Contact Rate',
//       value: `${analytics.contactRate.toFixed(1)}%`,
//       change: '-2.1%',
//       trend: 'down',
//       icon: Mail,
//       color: 'text-warning',
//     },
//     {
//       title: 'Avg. Response Time',
//       value: '2.4h',
//       change: '-15%',
//       trend: 'up',
//       icon: Calendar,
//       color: 'text-secondary',
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {kpiCards.map((kpi, index) => (
//           <Card key={index} className="hover-lift">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between space-y-0 pb-2">
//                 <div className="flex items-center space-x-2">
//                   <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
//                   <p className="text-sm font-medium text-muted-foreground">
//                     {kpi.title}
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-1">
//                   {kpi.trend === 'up' ? (
//                     <TrendingUp className="h-4 w-4 text-success" />
//                   ) : (
//                     <TrendingDown className="h-4 w-4 text-destructive" />
//                   )}
//                   <Badge 
//                     variant="outline" 
//                     className={kpi.trend === 'up' ? 'text-success border-success' : 'text-destructive border-destructive'}
//                   >
//                     {kpi.change}
//                   </Badge>
//                 </div>
//               </div>
//               <div className="text-2xl font-bold">{kpi.value}</div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Lead Trend Chart */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Lead Activity (Last 7 Days)</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <AreaChart data={analytics.last7Days}>
//                 <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
//                 <XAxis dataKey="date" className="text-sm" />
//                 <YAxis className="text-sm" />
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: 'hsl(var(--card))', 
//                     border: '1px solid hsl(var(--border))',
//                     borderRadius: '8px'
//                   }} 
//                 />
//                 <Legend />
//                 <Area
//                   type="monotone"
//                   dataKey="leads"
//                   stackId="1"
//                   stroke="#3B82F6"
//                   fill="#3B82F6"
//                   fillOpacity={0.3}
//                   name="New Leads"
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="contacts"
//                   stackId="1"
//                   stroke="#10B981"
//                   fill="#10B981"
//                   fillOpacity={0.3}
//                   name="Contacts Made"
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="conversions"
//                   stackId="1"
//                   stroke="#8B5CF6"
//                   fill="#8B5CF6"
//                   fillOpacity={0.3}
//                   name="Conversions"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Lead Sources */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Lead Sources</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={analytics.sourceData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={100}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   {analytics.sourceData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: 'hsl(var(--card))', 
//                     border: '1px solid hsl(var(--border))',
//                     borderRadius: '8px'
//                   }} 
//                 />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Status Distribution */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Lead Status Distribution</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={analytics.statusData}>
//                 <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
//                 <XAxis dataKey="name" className="text-sm" />
//                 <YAxis className="text-sm" />
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: 'hsl(var(--card))', 
//                     border: '1px solid hsl(var(--border))',
//                     borderRadius: '8px'
//                   }} 
//                 />
//                 <Bar dataKey="value" radius={[4, 4, 0, 0]}>
//                   {analytics.statusData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Performance Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Weekly Performance</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-muted-foreground">Leads Generated</span>
//                 <span className="font-semibold">{analytics.totalLeads}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-muted-foreground">Response Rate</span>
//                 <span className="font-semibold">{analytics.contactRate.toFixed(1)}%</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-muted-foreground">Conversion Rate</span>
//                 <span className="font-semibold">{analytics.conversionRate.toFixed(1)}%</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Top Performing Source</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {analytics.sourceData.length > 0 ? (
//                 <>
//                   <div className="text-2xl font-bold">{analytics.sourceData[0]?.name}</div>
//                   <div className="text-sm text-muted-foreground">
//                     {analytics.sourceData[0]?.value || 0} leads total
//                   </div>
//                   <Badge className="badge-new">Best Performer</Badge>
//                 </>
//               ) : (
//                 <>
//                   <div className="text-lg font-medium">No Data Yet</div>
//                   <div className="text-sm text-muted-foreground">
//                     Start creating leads to see analytics
//                   </div>
//                 </>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Recommendations</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3 text-sm">
//               <div className="flex items-start space-x-2">
//                 <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
//                 <span>Focus on social media campaigns to improve lead quality</span>
//               </div>
//               <div className="flex items-start space-x-2">
//                 <div className="h-2 w-2 rounded-full bg-success mt-2"></div>
//                 <span>Automate follow-up sequences for better response rates</span>
//               </div>
//               <div className="flex items-start space-x-2">
//                 <div className="h-2 w-2 rounded-full bg-warning mt-2"></div>
//                 <span>Implement lead scoring to prioritize high-value prospects</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };



import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Mail,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Lead } from "./Dashboard";

interface AnalyticsProps {
  leads: Lead[];
}

export const Analytics = ({ leads }: AnalyticsProps) => {
  const [timeRange, setTimeRange] = useState([7]); // Default to 7 days
  const [currentPeriod, setCurrentPeriod] = useState(0); // 0 = current period

  const analytics = useMemo(() => {
    const days = timeRange[0];
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === "new").length;
    const contactedLeads = leads.filter((l) => l.status === "contacted").length;
    const conversionRate =
      totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0;
    const contactRate =
      totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0;

    // Generate data for the selected time range with period offset
    const timeData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i) - currentPeriod * days);

      // Calculate leads created on this day
      const dayLeads = leads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return leadDate.toDateString() === date.toDateString();
      }).length;

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        leads: dayLeads,
        contacts: Math.max(0, dayLeads - 1),
        conversions: Math.max(0, Math.floor(dayLeads * 0.3)),
      };
    });

    const sourceData = [
      {
        name: "Manual",
        value: leads.filter((l) => l.source === "Manual").length,
        color: "#3B82F6",
      },
      {
        name: "Document",
        value: leads.filter((l) => l.source === "Document").length,
        color: "#8B5CF6",
      },
    ].filter((item) => item.value > 0);

    const statusData = [
      { name: "New", value: newLeads, color: "#10B981" },
      { name: "Contacted", value: contactedLeads, color: "#3B82F6" },
    ].filter((item) => item.value > 0);

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      conversionRate,
      contactRate,
      timeData,
      sourceData,
      statusData,
      days,
    };
  }, [leads, timeRange, currentPeriod]);

  const kpiCards = [
    {
      title: "Total Leads",
      value: analytics.totalLeads,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Conversion Rate",
      value: `${analytics.conversionRate.toFixed(1)}%`,
      change: "+5.2%",
      trend: "up",
      icon: Target,
      color: "text-success",
    },
    {
      title: "Contact Rate",
      value: `${analytics.contactRate.toFixed(1)}%`,
      change: "-2.1%",
      trend: "down",
      icon: Mail,
      color: "text-warning",
    },
    {
      title: "Avg. Response Time",
      value: "2.4h",
      change: "-15%",
      trend: "up",
      icon: Calendar,
      color: "text-secondary",
    },
  ];

  const getPeriodLabel = () => {
    const days = analytics.days;
    const offset = currentPeriod * days;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - offset);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1 - offset);

    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Time Range Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analytics Dashboard</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPeriod((prev) => prev + 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {getPeriodLabel()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPeriod((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPeriod === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Time Range:</span>
              <div className="flex-1 max-w-xs">
                <Slider
                  value={timeRange}
                  onValueChange={setTimeRange}
                  max={30}
                  min={3}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {timeRange[0]} days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <Badge
                    variant="outline"
                    className={
                      kpi.trend === "up"
                        ? "text-success border-success"
                        : "text-destructive border-destructive"
                    }
                  >
                    {kpi.change}
                  </Badge>
                </div>
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Activity ({analytics.days} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.timeData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  name="New Leads"
                />
                <Area
                  type="monotone"
                  dataKey="contacts"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  name="Contacts Made"
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  name="Conversions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.statusData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Period Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Leads Generated
                </span>
                <span className="font-semibold">{analytics.totalLeads}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Response Rate
                </span>
                <span className="font-semibold">
                  {analytics.contactRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Conversion Rate
                </span>
                <span className="font-semibold">
                  {analytics.conversionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.sourceData.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {analytics.sourceData[0]?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analytics.sourceData[0]?.value || 0} leads total
                  </div>
                  <Badge className="badge-new">Best Performer</Badge>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium">No Data Yet</div>
                  <div className="text-sm text-muted-foreground">
                    Start creating leads to see analytics
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                <span>
                  Focus on social media campaigns to improve lead quality
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-2 w-2 rounded-full bg-success mt-2"></div>
                <span>
                  Automate follow-up sequences for better response rates
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="h-2 w-2 rounded-full bg-warning mt-2"></div>
                <span>
                  Implement lead scoring to prioritize high-value prospects
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
