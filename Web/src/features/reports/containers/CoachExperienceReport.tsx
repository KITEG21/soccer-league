"use client";

import { PageHeader } from "@/shared/components/PageHeader";
import { useTranslations } from "next-intl";
import { AppLink } from "@/shared/components/AppLink";
import { APP_ROUTES } from "@/shared/config/routes";
import { useQuery } from "@tanstack/react-query";
import { reportsApiService } from "../services/api";
import { Loading } from "@/shared/components/Loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent } from "@/shared/components/ui/card";

export const CoachExperienceReport = () => {
  const t = useTranslations();
  const { data: coachesData, isLoading, isError } = useQuery({
    queryKey: ["reports", "coach-experience"],
    queryFn: () => reportsApiService.getCoachExperience(),
  });
  const coaches = coachesData ?? [];

  return (
    <div className="space-y-6">
      
      <PageHeader title={t("Reports.coachExperience.title")} />

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="py-8 text-center text-destructive">
            {t("Reports.coachExperience.error")}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>{t("Reports.coachExperience.coach")}</TableHead>
                  <TableHead className="text-center">{t("Reports.coachExperience.number")}</TableHead>
                  <TableHead>{t("Reports.coachExperience.currentTeam")}</TableHead>
                  <TableHead className="text-center">{t("Reports.coachExperience.yearsExperience")}</TableHead>
                  <TableHead className="text-center">{t("Reports.coachExperience.championships")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coaches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">{t("Common.noData")}</TableCell>
                  </TableRow>
                ) : (
                  coaches.map((coach, index) => (
                    <TableRow key={coach.id}>
                      <TableCell className="text-center font-bold">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <AppLink href={APP_ROUTES.coaches({ q: coach.name })}>{coach.name}</AppLink>
                      </TableCell>
                      <TableCell className="text-center">{coach.number}</TableCell>
                      <TableCell>
                        {coach.team_id ? (
                          <AppLink href={APP_ROUTES.team(coach.team_id)}>{coach.team_name}</AppLink>
                        ) : (
                          t("Reports.coachExperience.noTeam")
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold text-primary">{coach.experience_years} {t("Lists.years")}</TableCell>
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
