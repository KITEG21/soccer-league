import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { reportsApiService } from "../services/api";
import { Loading } from "@/shared/components/Loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent } from "@/shared/components/ui/card";
import { BreadcrumbNav } from "@/shared/components/BreadcrumbNav";
import { t } from "@/shared/translations";

export const CoachExperienceReport = () => {
  const { data: coachesData, isLoading, isError } = useQuery({
    queryKey: ["reports", "coach-experience"],
    queryFn: () => reportsApiService.getCoachExperience(),
  });
  const coaches = coachesData ?? [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BreadcrumbNav items={[{ label: t.common.reports, to: "/" }, { label: t.coachExperience.breadcrumb }]} />
      
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Award className="text-primary" /> {t.coachExperience.title}
      </h1>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t.coachExperience.error}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>{t.coachExperience.coach}</TableHead>
                  <TableHead className="text-center">{t.coachExperience.number}</TableHead>
                  <TableHead>{t.coachExperience.currentTeam}</TableHead>
                  <TableHead className="text-center">{t.coachExperience.yearsExperience}</TableHead>
                  <TableHead className="text-center">{t.coachExperience.championships}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coaches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">{t.common.noData}</TableCell>
                  </TableRow>
                ) : (
                  coaches.map((coach, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center font-bold">{index + 1}</TableCell>
                      <TableCell className="font-medium">{coach.name}</TableCell>
                      <TableCell className="text-center">{coach.number}</TableCell>
                      <TableCell>{coach.team_name || t.coachExperience.noTeam}</TableCell>
                      <TableCell className="text-center font-bold text-primary">{coach.experience_years} años</TableCell>
                      <TableCell className="text-center">{coach.championships_won}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
