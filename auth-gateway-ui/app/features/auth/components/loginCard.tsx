import { Box, Card, Flex } from "@radix-ui/themes";

export function LoginCard({ children }: { children: React.ReactNode }) {
  return (
    <Box width="100%" maxWidth="400px" asChild>
      <Card size="3">
        <Flex direction="column" gap="4">
          {children}
        </Flex>
      </Card>
    </Box>
  );
}