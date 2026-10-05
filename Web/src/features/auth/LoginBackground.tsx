import { soccerBall } from "@lucide/lab";
import { Flag, Icon, Shield, Trophy } from "lucide-react";

export const LoginBackground = () => (
  <div aria-hidden="true" className="parallax-background">
    <div className="parallax-layer parallax-layer-far">
      <Icon iconNode={soccerBall} className="parallax-object parallax-ball-far" />
      <Flag className="parallax-object parallax-flag-far" />
      <Trophy className="parallax-object parallax-trophy-far" />
    </div>
    <div className="parallax-layer parallax-layer-middle">
      <Shield className="parallax-object parallax-shield" />
      <Icon iconNode={soccerBall} className="parallax-object parallax-ball-middle" />
    </div>
    <div className="parallax-layer parallax-layer-near">
      <Trophy className="parallax-object parallax-trophy" />
      <Flag className="parallax-object parallax-flag-near" />
      <Shield className="parallax-object parallax-shield-near" />
    </div>
  </div>
);
