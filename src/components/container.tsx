import { cn } from "@/lib/utils";

interface ContainerProps extends React.ComponentProps<"div"> {
    children: React.ReactNode;
    className?: string;
}

const Container = ({ children, className, ...props }: ContainerProps) => {
  return (
    <div {...props} className={cn("max-w-5xl mx-auto px-5", className)}>
      {children}
    </div>
  );
};

export default Container;
