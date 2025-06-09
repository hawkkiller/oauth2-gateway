import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function LoginCard({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="w-full max-w-[400px]">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">{children}</div>
        </CardContent>
      </Card>
    </div>
  );
}
